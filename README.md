# FILESHARE: SECURE DATA TRANSMISSION PROTOCOL

An open-source file sharing application with a cyberpunk dystopian interface. Built with Next.js, Supabase, and Tailwind CSS.

**[LIVE DEPLOYMENT](https://share.alora.is-a.dev/)**

![FileShare Interface](https://lrwofykyjxqtsogrbksu.supabase.co/storage/v1/object/public/files/uploads/979d30a4-637f-45c0-a62a-9b26f085dfb2.png)
![Admin Panel](https://lrwofykyjxqtsogrbksu.supabase.co/storage/v1/object/public/files/uploads/c69be0a0-b1be-4bab-881e-129357c17a1e.png)

## SYSTEM PROTOCOLS

- **CLIENT-SIDE ENCRYPTION**: Optional file encryption with password protection
- **EXPIRATION SETTINGS**: Configure files to expire after a set time
- **WIDE FORMAT SUPPORT**: Upload and share various file types (images, documents, etc.)
- **ADMIN INTERFACE**: Basic file management and system configuration
- **RESPONSIVE DESIGN**: Works across desktop and mobile devices
- **OPTIMIZED TRANSFERS**: Efficient upload and download processing

## TECHNICAL SPECIFICATIONS

- **FRONTEND**: Next.js 14+ / React / TypeScript
- **UI COMPONENTS**: Shadcn UI / Tailwind CSS with dystopian styling
- **STORAGE**: Supabase Storage for file hosting
- **DATABASE**: Supabase for metadata and settings
- **DEPLOYMENT**: Suitable for Vercel or any Next.js host

## KNOWN LIMITATIONS

- **IP DETECTION**: Local development may have issues with IP-based file association
- **STORAGE LIMITS**: Depends on your Supabase plan's storage capacity
- **ENCRYPTION**: Client-side only; server-side encryption not implemented
- **ERROR HANDLING**: Some edge cases may not be properly handled

## INITIALIZATION SEQUENCE

### PREREQUISITES

- Node.js (v18+)
- NPM or Yarn package management system
- Supabase account (free tier works for testing)

### SYSTEM INSTALLATION

1. Clone the repository to your local terminal:
   ```bash
   git clone https://github.com/yourusername/fileshare.git
   cd fileshare
   ```

2. Install required dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables by creating `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_CRYPTO_KEY=your_encryption_key
   ```

4. Activate the development interface:
   ```bash
   npm run dev
   ```

5. Access the system at [http://localhost:3000](http://localhost:3000)

### SUPABASE CONFIGURATION

1. Create a new Supabase project
2. Create a storage bucket named "files"
3. Create a folder named "uploads" in the "files" bucket
4. Configure the storage policies:
   - For anonymous uploads: INSERT policy with condition `true`
   - For public access: SELECT policy with condition `true`

## OPERATIONAL PROCEDURES

### UPLOADING FILES

1. Navigate to the upload interface
2. Drag and drop files or select them from your device
3. Configure optional security settings:
   - Password protection
   - Encryption (optional)
   - Expiration date
4. Click upload and wait for completion
5. Copy and share the generated file links

### ADMIN INTERFACE

Access the admin dashboard at `/admin` to:

- View basic analytics
- Manage uploaded files
- Configure site settings
- Access trash/deleted files

## CUSTOMIZATION

### CONFIGURATION OPTIONS

Modify the application through the admin interface:

- **Display Settings**: Site name, description, appearance
- **Storage Settings**: Maximum file size, allowed types
- **Security Options**: Access control settings

## CONTRIBUTING

This project is open source. Contributions, bug reports, and feature requests are welcome. Please feel free to submit pull requests or open issues on GitHub.

## LICENSE

This project is licensed under the MIT License - see the LICENSE file for details.

## ACKNOWLEDGMENTS

- Shadcn UI for component library
- Vercel for hosting capabilities
- Supabase for backend services

## LIVE DEMO

Visit **[https://share.alora.is-a.dev/](https://share.alora.is-a.dev/)** to see the application in action. 