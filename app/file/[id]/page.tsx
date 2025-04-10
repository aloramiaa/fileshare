// This is the server component
import { FC } from "react"
import FilePageClient from "./client-page"

type FilePageParams = {
  params: {
    id: string
  }
}

// Server component to handle params
const FilePage: FC<FilePageParams> = ({ params }) => {
  return <FilePageClient fileId={params.id} />
}

export default FilePage

// Move the client component to a new file called client-page.tsx
