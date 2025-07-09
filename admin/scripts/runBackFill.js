// runBackfill.js
const admin = require('firebase-admin');

// Replace with your service account key path or configure differently
// For local development, download your project's service account key (JSON file)
// from Firebase Console -> Project settings -> Service accounts -> Generate new private key
const serviceAccount = require('./serviceAccountKey.json'); // <--- IMPORTANT: Update this path!

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
  // databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com" // Not strictly needed for Firestore
});

const db = admin.firestore();

// Copy the entire core logic of your backfillAggregates function here
// Exclude the 'functions.https.onCall' wrapper and 'context.auth' check
async function performBackfill() {
    console.log("Starting local backfill process...");

    let totalUsersCount = 0;
    let totalOrdersCount = 0;
    let totalRevenue = 0;
    let totalProductsSold = 0;
    let pendingDeliveriesCount = 0;
    const monthlySalesMap = {};

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

    try {
        const usersSnapshot = await db.collection("Users").get();
        totalUsersCount = usersSnapshot.size;
        console.log(`Calculated total users: ${totalUsersCount}`);
    } catch (error) {
        console.error("Error calculating total users:", error);
        return {status: "error", message: "Failed to calculate total users."};
    }

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

            totalRevenue += order.totalAmount || 0;
            totalProductsSold += (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

            if (order.status === "Pending" || order.status === "For Delivery") {
                pendingDeliveriesCount++;
            }

            if (order.createdAt && order.createdAt.toDate() >= thirtyDaysAgo.toDate()) {
                ordersLast30DaysCount++;
            }

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

        await db.runTransaction(async (transaction) => {
            const statsRef = db.collection("dashboardStats").doc("summary");
            transaction.set(statsRef, {
                totalUsers: totalUsersCount,
                totalOrdersAllTime: totalOrdersCount,
                totalRevenue: totalRevenue,
                totalProductsSold: totalProductsSold,
                pendingDeliveries: pendingDeliveriesCount,
                ordersLast30Days: ordersLast30DaysCount,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            }, {merge: true});
        });
        console.log("Dashboard stats summary updated.");

        const monthlySalesBatch = db.batch();
        for (const monthKey in monthlySalesMap) {
            if (Object.prototype.hasOwnProperty.call(monthlySalesMap, monthKey)) {
                const monthData = monthlySalesMap[monthKey];
                const monthlySalesRef = db.collection("monthlySales").doc(monthKey);
                monthlySalesBatch.set(monthlySalesRef, monthData, {merge: true});
            }
        }
        await monthlySalesBatch.commit();
        console.log("Monthly sales collection updated.");

    } catch (error) {
        console.error("Error during local backfill:", error);
        return {status: "error", message: `Failed to backfill order data: ${error.message}`};
    }

    console.log("Local backfill process completed successfully!");
    return {status: "success", message: "All aggregate data has been backfilled."};
}

performBackfill()
  .then(res => console.log("Backfill result:", res))
  .catch(err => console.error("Unhandled backfill error:", err))
  .finally(() => process.exit()); // Exit the Node.js process when done