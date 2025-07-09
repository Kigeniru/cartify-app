// functions/index.js

// Import necessary Firebase modules
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore(); // Get a Firestore instance

// --- Function to count Total Users (on Users create and delete) ---
// Triggered when a new user document is created in the 'Users' collection.
exports.countTotalUsersOnCreate = functions.firestore
    .document("Users/{userId}")
    .onCreate(async (snap, context) => {
      const statsRef = db.collection("dashboardStats").doc("summary");
      await statsRef.set({
        totalUsers: admin.firestore.FieldValue.increment(1), // Increment totalUsers
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true}); // Use merge: true to avoid overwriting other fields
      console.log("Total users incremented on create.");
      return null;
    });

// Triggered when a user document is deleted from the 'Users' collection.
exports.countTotalUsersOnDelete = functions.firestore
    .document("Users/{userId}") // Listen for changes in the 'Users' (uppercase) collection
    .onDelete(async (snap, context) => {
      const statsRef = db.collection("dashboardStats").doc("summary");
      await statsRef.set({
        totalUsers: admin.firestore.FieldValue.increment(-1), // Decrement totalUsers
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});
      console.log("Total users decremented on delete.");
      return null;
    });

// --- Functions for Orders-Related Metrics (on orders write) ---
// This function updates: totalRevenue, totalProductsSold, totalOrdersAllTime,
// pendingDeliveries
exports.updateOrdersDashboardStats = functions.firestore
    .document("orders/{orderId}") // Listen for changes in the 'orders' collection
    .onWrite(async (change, context) => {
      const statsRef = db.collection("dashboardStats").doc("summary");

      const oldOrder = change.before.exists ? change.before.data() : null;
      const newOrder = change.after.exists ? change.after.data() : null;

      let ordersChange = 0;
      let revenueChange = 0;
      let productsSoldChange = 0;
      let pendingDeliveriesChange = 0;

      // Calculate changes based on the type of write operation (create, update, delete)
      if (newOrder && !oldOrder) { // Order Created
        ordersChange = 1;
        revenueChange = newOrder.totalAmount || 0;
        productsSoldChange = newOrder.items.reduce(
            (sum, item) => sum + item.quantity, 0,
        );
        // Assuming 'Pending' or 'For Delivery' are your pending statuses
        if (newOrder.status === "Pending" || newOrder.status === "For Delivery") {
          pendingDeliveriesChange = 1;
        }
      } else if (newOrder && oldOrder) { // Order Updated
      // Total orders count doesn't change on update
        revenueChange = (newOrder.totalAmount || 0) - (oldOrder.totalAmount || 0);
        productsSoldChange = newOrder.items.reduce(
            (sum, item) => sum + item.quantity, 0,
        ) - oldOrder.items.reduce((sum, item) => sum + item.quantity, 0);

        // Handle pending deliveries status change
        const wasPending = (oldOrder.status === "Pending" ||
                          oldOrder.status === "For Delivery");
        const isPending = (newOrder.status === "Pending" ||
                         newOrder.status === "For Delivery");

        if (isPending && !wasPending) {
          pendingDeliveriesChange = 1; // Order status changed TO pending
        } else if (!isPending && wasPending) {
          pendingDeliveriesChange = -1; // Order status changed FROM pending
        }
      } else if (!newOrder && oldOrder) { // Order Deleted
        ordersChange = -1;
        revenueChange = -(oldOrder.totalAmount || 0);
        productsSoldChange = -(oldOrder.items.reduce(
            (sum, item) => sum + item.quantity, 0,
        ));
        // If the deleted order was pending, decrement count
        if (oldOrder.status === "Pending" || oldOrder.status === "For Delivery") {
          pendingDeliveriesChange = -1;
        }
      }

      // Update counts in a transaction for atomicity and to avoid race conditions
      return db.runTransaction(async (transaction) => {
        const doc = await transaction.get(statsRef);
        const data = doc.data() || {}; // Initialize if document doesn't exist

        transaction.set(statsRef, {
          totalOrdersAllTime: (data.totalOrdersAllTime || 0) + ordersChange,
          totalRevenue: (data.totalRevenue || 0) + revenueChange,
          totalProductsSold: (data.totalProductsSold || 0) + productsSoldChange,
          pendingDeliveries: (data.pendingDeliveries || 0) + pendingDeliveriesChange,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        }, {merge: true}); // Use merge to only update specified fields
      });
    });

// --- Function to Aggregate Monthly Sales (on orders write) ---
// This function updates the 'monthlySales' collection for charting.
// --- Function to Aggregate Monthly Sales (on orders write) ---
// This function updates the 'monthlySales' collection for charting.
exports.aggregateMonthlySales = functions.firestore
    .document("orders/{orderId}") // Listen for changes in the 'orders' collection
    .onWrite(async (change, context) => {
      const oldOrder = change.before.exists ? change.before.data() : null;
      const newOrder = change.after.exists ? change.after.data() : null;

      // Helper to get month/year key from Firestore Timestamp
      const getMonthYearKeyAndTimestamp = (firestoreTimestamp) => {
        if (!firestoreTimestamp) return null;
        const date = firestoreTimestamp.toDate();
        const year = date.getFullYear();
        // Format as YYYY-MM (e.g., "2025-07") for consistent document IDs
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const monthName = date.toLocaleString("en-US", {month: "short"}); // e.g., "Jul"
        // Timestamp at end of month for consistent sorting in charts
        const endOfMonthTimestamp = admin.firestore.Timestamp.fromDate(
            new Date(year, date.getMonth() + 1, 0, 23, 59, 59, 999),
        );
        return {key: `${year}-${month}`, monthName, year, timestamp: endOfMonthTimestamp};
      };

      const oldOrderData = oldOrder ? {
        amount: oldOrder.totalAmount || 0,
        dateInfo: getMonthYearKeyAndTimestamp(oldOrder.createdAt), // Use createdAt
      } : null;

      const newOrderData = newOrder ? {
        amount: newOrder.totalAmount || 0,
        dateInfo: getMonthYearKeyAndTimestamp(newOrder.createdAt), // Use createdAt
      } : null;

      const batch = db.batch();
      let hasWrites = false; // <<< ADD THIS LINE <<<

      // Logic to adjust sales for the old month (if order was deleted or moved months)
      if (oldOrderData && oldOrderData.dateInfo) {
        if (!newOrderData || oldOrderData.dateInfo.key !== newOrderData.dateInfo.key) {
        // Order deleted OR order moved to a different month
          const monthlySalesRef = db.collection("monthlySales")
              .doc(oldOrderData.dateInfo.key);
          batch.set(monthlySalesRef, {
            salesAmount: admin.firestore.FieldValue.increment(-oldOrderData.amount),
          }, {merge: true});
          hasWrites = true; // <<< ADD THIS LINE <<<
        } else if (oldOrderData.amount !== newOrderData.amount) {
        // Order updated within the same month, and totalAmount changed
          const monthlySalesRef = db.collection("monthlySales")
              .doc(oldOrderData.dateInfo.key);
          batch.set(monthlySalesRef, {
            salesAmount: admin.firestore.FieldValue.increment(
                newOrderData.amount - oldOrderData.amount,
            ),
          }, {merge: true});
          hasWrites = true; // <<< ADD THIS LINE <<<
        }
      }

      // Logic to adjust sales for the new month (if order was created or moved months)
      if (newOrderData && newOrderData.dateInfo &&
        (!oldOrderData || oldOrderData.dateInfo.key !== newOrderData.dateInfo.key)) {
      // Order created OR order moved from a different month
        const monthlySalesRef = db.collection("monthlySales")
            .doc(newOrderData.dateInfo.key);
        batch.set(monthlySalesRef, {
          salesAmount: admin.firestore.FieldValue.increment(newOrderData.amount),
          monthName: newOrderData.dateInfo.monthName,
          year: newOrderData.dateInfo.year,
          timestamp: newOrderData.dateInfo.timestamp,
        }, {merge: true}); // merge: true is crucial here for incrementing
        hasWrites = true; // <<< ADD THIS LINE <<<
      }

      // Commit the batch if there are any pending writes
      if (hasWrites) { // <<< CHANGED THIS LINE <<<
        await batch.commit();
        console.log("Monthly sales aggregation batch committed.");
      } else {
        console.log("No relevant change for monthly sales aggregation.");
      }

      return null; // Important: Cloud Functions must return a Promise or null
    });

// --- Scheduled Function for "Orders Last 30 Days" ---
// This function runs periodically (e.g., every hour) to count orders in the last 30 days.
exports.updateOrdersLast30Days = functions.pubsub.schedule("0 * * * *")
    .onRun(async (context) => {
    // Calculate the timestamp for 30 days ago
      const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      );

      const statsRef = db.collection("dashboardStats").doc("summary");

      try {
      // Query orders created within the last 30 days
        const ordersLast30DaysSnapshot = await db.collection("orders")
            .where("createdAt", ">=", thirtyDaysAgo)
            .get();
        const ordersLast30DaysCount = ordersLast30DaysSnapshot.size; // Get the count

        // Update the 'ordersLast30Days' field in the dashboardStats summary document
        await statsRef.update({
          ordersLast30Days: ordersLast30DaysCount,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Orders last 30 days updated: ${ordersLast30DaysCount}`);
      } catch (error) {
        console.error("Error updating last 30 days orders:", error);
      }
    });

// --- Function to create/update Firestore user document on Auth creation ---
// This function automatically creates a document in your 'Users' collection
// when a new user signs up via Firebase Authentication.
exports.createFirestoreUserDocument = functions.auth.user().onCreate(async (user) => {
  const userRef = db.collection("Users").doc(user.uid); // Use 'Users' (uppercase)

  try {
    // Get the user's custom claims to check if they are an admin
    const customClaims = (await admin.auth().getUser(user.uid)).customClaims;
    const isAdmin = customClaims && customClaims.admin === true;

    // Set the user document in Firestore
    await userRef.set({
      email: user.email,
      // You can add other default fields here if needed
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isAdmin: isAdmin, // Store admin status directly in Firestore
      // Add placeholders for other fields from your User structure
      firstName: user.displayName ? user.displayName.split(" ")[0] : null,
      lastName: user.displayName ? user.displayName.split(" ").slice(1).join(" ") : null,
      photo: user.photoURL || null,
      contactInfo: null,
      deliveryInfo: {
        components: {},
        fullAddress: null,
      },
    }, {merge: true});

    console.log(`Firestore user document created/updated for UID: ${user.uid}, ` +
                `Email: ${user.email}, IsAdmin: ${isAdmin}`);
  } catch (error) {
    console.error(`Error creating/updating Firestore user document for UID: ` +
                  `${user.uid}`, error);
  }
});

exports.backfillAggregates = functions.https.onCall(async (data, context) => {
  // 1. Security Check: Only allow authenticated admins to run this function
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Only administrators can run the backfill process.",
    );
  }

  console.log("Starting backfill process...");

  // Initialize aggregates
  let totalUsersCount = 0;
  let totalOrdersCount = 0;
  let totalRevenue = 0;
  let totalProductsSold = 0;
  let pendingDeliveriesCount = 0;
  const monthlySalesMap = {};

  // Helper to get month/year key from Firestore Timestamp
  const getMonthYearKeyAndTimestamp = (firestoreTimestamp) => {
    if (!firestoreTimestamp) return null;
    const date = firestoreTimestamp.toDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const monthName = date.toLocaleString("en-US", {month: "short"});
    const endOfMonthTimestamp = admin.firestore.Timestamp.fromDate(
        new Date(year, date.getMonth() + 1, 0, 23, 59, 59, 999),
    );
    return {key: `${year}-${month}`, monthName, year, timestamp: endOfMonthTimestamp};
  };

  // --- 2. Calculate User Count ---
  try {
    const usersSnapshot = await db.collection("Users").get();
    totalUsersCount = usersSnapshot.size;
    console.log(`Calculated total users: ${totalUsersCount}`);
  } catch (error) {
    console.error("Error calculating total users:", error);
    throw new functions.https.HttpsError("internal", "Failed to calculate total users.");
  }

  // --- 3. Calculate Order Aggregates ---
  try {
    const ordersSnapshot = await db.collection("orders").get();
    totalOrdersCount = ordersSnapshot.size;
    console.log(`Found total orders: ${totalOrdersCount}`);

    const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    );
    let ordersLast30DaysCount = 0;

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();

      // Total Revenue, Products Sold
      totalRevenue += order.totalAmount || 0;
      totalProductsSold += (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

      // Pending Deliveries
      if (order.status === "Pending" || order.status === "For Delivery") {
        pendingDeliveriesCount++;
      }

      // Orders Last 30 Days
      if (order.createdAt && order.createdAt.toDate() >= thirtyDaysAgo.toDate()) {
        ordersLast30DaysCount++;
      }

      // Monthly Sales Aggregation
      const dateInfo = getMonthYearKeyAndTimestamp(order.createdAt);
      if (dateInfo) {
        if (!monthlySalesMap[dateInfo.key]) {
          monthlySalesMap[dateInfo.key] = {
            salesAmount: 0,
            monthName: dateInfo.monthName,
            year: dateInfo.year,
            timestamp: dateInfo.timestamp,
          };
        }
        monthlySalesMap[dateInfo.key].salesAmount += order.totalAmount || 0;
      }
    });
    console.log("Finished processing all orders.");

    // --- 4. Update dashboardStats/summary (using a transaction for safety) ---
    await db.runTransaction(async (transaction) => {
      const statsRef = db.collection("dashboardStats").doc("summary");
      transaction.set(statsRef, {
        totalUsers: totalUsersCount,
        totalOrdersAllTime: totalOrdersCount,
        totalRevenue: totalRevenue,
        totalProductsSold: totalProductsSold,
        pendingDeliveries: pendingDeliveriesCount,
        ordersLast30Days: ordersLast30DaysCount, // Update this as part of backfill
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});
    });
    console.log("Dashboard stats summary updated.");

    // --- 5. Update monthlySales Collection (using a batch for efficiency) ---
    // functions/index.js (around line 365)
    const monthlySalesBatch = db.batch();
    for (const monthKey in monthlySalesMap) {
      // Add this check:
      if (Object.prototype.hasOwnProperty.call(monthlySalesMap, monthKey)) {
        const monthData = monthlySalesMap[monthKey];
        const monthlySalesRef = db.collection("monthlySales").doc(monthKey);
        monthlySalesBatch.set(monthlySalesRef, monthData, {merge: true});
      } // Close the if statement
    }
    await monthlySalesBatch.commit();
    console.log("Monthly sales collection updated.");
  } catch (error) {
    console.error("Error during orders backfill:", error);
    throw new functions.https.HttpsError("internal", "Failed to backfill order data.");
  }

  console.log("Backfill process completed successfully!");
  return {status: "success", message: "All aggregate data has been backfilled."};
});

