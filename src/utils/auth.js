import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  deleteUser,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import Resizer from "react-image-file-resizer";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSEGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

// Contory calling code
const countryPhoneNumber = process.env.NEXT_PUBLIC_FIREBASE_COUNTRY_PHONENUMBER;

// Mask the global 'window' for this snippet file
const window = {
  recaptchaVerifier: undefined,
};

export const recaptchaVerifierInvisible = () => {
  const auth = getAuth(app);
  window.recaptchaVerifier = new RecaptchaVerifier(
    "sign-in-button",
    {
      size: "invisible",
      callback: (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        // onSignInSubmit()
      },
    },
    auth
  );
};

export const verifyCode = async (userInputCode) => {
  const getCodeFromUserInput = () => {
    return userInputCode;
  };
  const getAppConfirmResult = () => {
    const { confirmationResult } = window;
    return confirmationResult;
  };

  const appConfirmResult = getAppConfirmResult();
  const verificationCode = getCodeFromUserInput();

  const userCredentialImpl = await appConfirmResult
    .confirm(verificationCode)
    .catch((err) => {
      throw err;
    });
  return userCredentialImpl.user;
};

export const phoneSignin = async (userPhoneNumber) => {
  const auth = getAuth(app);
  const getPhoneNumber = () => {
    if (userPhoneNumber.startsWith("+")) {
      return userPhoneNumber;
    }
    return countryPhoneNumber.concat(userPhoneNumber);
  };
  const phoneNumber = getPhoneNumber();
  const appVerifier = window.recaptchaVerifier;
  await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      localStorage.setItem("confirmationResult", confirmationResult);
    })
    .catch((error) => {
      throw error;
    });
};

export const signout = async () => {
  const auth = getAuth(app);
  await signOut(auth)
    .then(() => {
      localStorage.removeItem("confirmationResult");
      localStorage.removeItem("eid");
    })
    .catch((error) => {
      throw error;
    });
};

export const deleteFirebaseUser = async () => {
  const auth = getAuth(app);
  const user = auth.currentUser;

  await deleteUser(user)
    .then(() => {
      // User deleted.
    })
    .catch((error) => {
      throw error;
    });
};

const generateUUID = () => {
  // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const resizeImage = (file) =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      100,
      100,
      "JPEG",
      70,
      0,
      (uri) => {
        resolve(uri);
      },
      "file"
    );
  });

export const uploadFile = async (path, image2, callback) => {
  const uuid = generateUUID();

  const image = await resizeImage(image2);

  const storageRef = ref(storage, `${path}/${uuid}-${image.name}`);
  if (image == null) return;

  const metadata = {
    cacheControl: "public,max-age=86400",
    contentType: "image/jpeg",
  };

  uploadBytes(storageRef, image, metadata).then(() => {
    getDownloadURL(storageRef).then((url) => {
      callback(url);
    });
  });
};
