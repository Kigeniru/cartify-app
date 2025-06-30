import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../../firebase";
import { toast } from "react-toastify";
import { setDoc, doc } from "firebase/firestore";
import './SignInWithGoogle.css'
function SignInwithGoogle() {
  function googleLogin() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then(async (result) => {
      console.log(result);
      const user = result.user;
      if (result.user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: user.displayName,
          photo: user.photoURL,
          lastName: "",
        });
        toast.success("User logged in Successfully", {
          position: "top-center",
        });
        window.location.href = "/"; // Redirect to /product after login
      }
    });
  }

  return (
    <div className="login-with-google-container">
      
      <button type="button" class="login-with-google-btn" onClick={googleLogin} >
  Continue with Google
</button>
   
      <p className="continue-p">OR</p> 
    </div>
  );
}

export default SignInwithGoogle;
