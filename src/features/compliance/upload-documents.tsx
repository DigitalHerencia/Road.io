import { uploadDocumentsAction } from '@/lib/actions/compliance';
import { DOCUMENT_CATEGORIES } from '@/features/compliance/types';

export default function UploadDocuments() {
  return (
    <form
      action={async (formData) => {
        await uploadDocumentsAction(formData);
      }}
      className="space-y-4"
      encType="multipart/form-data"
    >
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
      <div>
        <label htmlFor="expiresAt" className="block text-sm font-medium">Expiration Date</label>
        <input id="expiresAt" name="expiresAt" type="date" className="border rounded p-2" />
      </div>
      <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Upload</button>
    </form>
  );
}
