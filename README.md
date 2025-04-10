
# 🛡️ FILESHARE: Secure Data Transmission Protocol

An open-source, cyberpunk-dystopian file sharing interface built with **Next.js**, **Supabase**, and **Tailwind CSS**.

🌐 **[LIVE DEPLOYMENT →](https://share.alora.is-a.dev/)**

---

## 🖼️ Interface Preview

![FileShare Interface](https://lrwofykyjxqtsogrbksu.supabase.co/storage/v1/object/public/files/uploads/979d30a4-637f-45c0-a62a-9b26f085dfb2.png)
![Admin Panel](https://lrwofykyjxqtsogrbksu.supabase.co/storage/v1/object/public/files/uploads/c69be0a0-b1be-4bab-881e-129357c17a1e.png)

---

## ⚙️ System Protocols

- 🔒 **Client-Side Encryption** — Password-protected optional encryption
- ⏳ **Expiration Settings** — Auto-delete files after a configured time
- 🗃️ **Wide Format Support** — Share documents, images, and more
- 🛠️ **Admin Interface** — File and system management controls
- 📱 **Responsive Design** — Mobile and desktop optimized
- 🚀 **Optimized Transfers** — Fast uploads and downloads

---

## 🧰 Technical Specifications

- **Frontend:** Next.js 14+, React, TypeScript  
- **UI Components:** Shadcn UI, Tailwind CSS  
- **Storage:** Supabase Storage  
- **Database:** Supabase (PostgreSQL)  
- **Deployment:** Ready for Vercel or any Next.js host  

---

## ⚠️ Known Limitations

- 🌐 **IP Detection:** May not work accurately in local development
- 💾 **Storage Limits:** Based on your Supabase plan
- 🔐 **Encryption:** Only client-side encryption supported
- ❗ **Error Handling:** Some edge cases may not be fully handled

---

## 🛠️ Initialization Sequence

### ✅ Prerequisites

- Node.js v18+
- NPM or Yarn
- Supabase account (Free tier is sufficient)

### 📦 Installation

```bash
git clone https://github.com/yourusername/fileshare.git
cd fileshare
npm install
```

### ⚙️ Environment Setup

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CRYPTO_KEY=your_encryption_key
```

### 🚀 Launch Development Server

```bash
npm run dev
```

Then open: [http://localhost:3000](http://localhost:3000)

---

## 🧱 Supabase Configuration

1. Create a new Supabase project
2. Add a **storage bucket** named `files`
3. Inside the bucket, create a folder: `uploads`
4. Set **Storage Policies**:
   - `INSERT` policy for anonymous uploads → `true`
   - `SELECT` policy for public access → `true`

---

## 📤 Uploading Files

1. Open the upload interface
2. Drag & drop or select files
3. Configure security options:
   - Password protection
   - Encryption (optional)
   - Expiration date
4. Click **Upload**
5. Share the generated link

---

## 🛡️ Admin Interface

Navigate to `/admin` to:

- View analytics
- Manage files
- Adjust settings
- Access trash bin

---

## 🎨 Customization Options

Modify settings via the admin panel:

- **Display Settings** — Site title, branding, UI theme
- **Storage Settings** — Max file size, allowed file types
- **Security Settings** — Access control configurations

---

## 🤝 Contributing

Open-source and welcoming of contributions!  
Report bugs, request features, or submit pull requests via GitHub.

---

## 📄 License

Licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for more info.

---

## 🙏 Acknowledgments

- 🧩 **Shadcn UI** for sleek components  
- 🚀 **Vercel** for deployment support  
- 🧠 **Supabase** for the real-time backend

---

## 🔗 Live Demo

🎥 See it in action: [https://share.alora.is-a.dev/](https://share.alora.is-a.dev/)
