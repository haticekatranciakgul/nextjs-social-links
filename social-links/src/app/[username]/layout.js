import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function generateMetadata({ params }) {
  const username = params.username;
  
  try {
    // Username'den UID'yi bul
    const usernameDoc = await getDoc(doc(db, "usernames", username));
    
    if (!usernameDoc.exists()) {
      return {
        title: `@${username} - Kullanıcı Bulunamadı | Social Links`,
        description: `@${username} kullanıcısı bulunamadı. Sosyal medya linklerinizi paylaşın!`,
      };
    }

    const uid = usernameDoc.data().uid;
    
    // Kullanıcı bilgilerini çek
    const userDoc = await getDoc(doc(db, "users", uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    const displayName = userData.displayName || `@${username}`;
    const bio = userData.bio || "Sosyal medya linklerimi keşfet!";
    
    return {
      title: `${displayName} (@${username}) | Social Links`,
      description: bio,
      openGraph: {
        title: `${displayName} (@${username})`,
        description: bio,
        url: `https://nextjs-social-links.vercel.app/${username}`,
        siteName: 'Social Links',
        type: 'profile',
      },
      twitter: {
        card: 'summary',
        title: `${displayName} (@${username})`,
        description: bio,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: `@${username} | Social Links`,
      description: "Sosyal medya linklerini keşfet!",
    };
  }
}

export default function UsernameLayout({ children }) {
  return children;
}