import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../../components/firebase";

const saveDeliveryInfo = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const deliveryRef = doc(db, "users", user.uid, "documents", "deliveryInfo");
  await setDoc(deliveryRef, {
    address: "123 Sample Street",
    city: "Manila",
    postalCode: "1000",
  });
};
