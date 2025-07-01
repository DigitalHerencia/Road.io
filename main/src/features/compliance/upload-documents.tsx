import { uploadDocumentsAction } from '@/lib/actions/compliance';
import { DOCUMENT_CATEGORIES } from '@/types/compliance';

export default function UploadDocuments() {
  return (
    <form action={uploadDocumentsAction} className="space-y-4" encType="multipart/form-data">
      <div>
        <label htmlFor="category" className="block text-sm font-medium">Category</label>
        <select id="category" name="category" className="border rounded p-2">
          {DOCUMENT_CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="documents" className="block text-sm font-medium">Documents</label>
        <input id="documents" name="documents" type="file" multiple className="block" />
      </div>
      <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Upload</button>
    </form>
  );
}
