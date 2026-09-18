import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import * as XLSX from 'xlsx';
import { fileFormat } from '../lib/helpers';
import { uploadFile } from '../lib/api';

function FileUpload({ fileUploadOpen, setFileUploadOpen }: { fileUploadOpen: boolean; setFileUploadOpen: (open: boolean) => void }) {
    // State to manage file upload
    const [file, setFile] = useState<File | undefined>();
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const targetFiles = e.target.files;
        if (targetFiles && (targetFiles[0].type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || targetFiles[0].type === 'application/vnd.ms-excel')) {
            setFile(targetFiles[0]);
            setError(null);
        } else {
            setError('Please select only Excel file');
        }
    };

    const handleDialogClose = () => {
        setFileUploadOpen(false);
        setFile(undefined);
        setError(null);
        setUploadProgress(0);
        setShowProgress(false);
    };

    const handleUploadClick = async () => {
        if (!file) {
            setError('Please choose an Excel file');
            return;
        }

        setShowProgress(true);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });

            // 1. Check for expected sheets
            const sheetNames = workbook.SheetNames.map(name => name.trim());
            
            const missingSheets = fileFormat.expectedSheets.filter(
                sheet => !sheetNames.includes(sheet)
            );
            if (missingSheets.length > 0) {
                setError(`Missing sheets: ${missingSheets.join(', ')}`);
                setShowProgress(false);
                return;
            }

            // 2. Check headers for each sheet
            for (const sheetName of fileFormat.expectedSheets) {
                const worksheet = workbook.Sheets[sheetName];
                const rawHeaders = (XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 })[0] || []) as any[];
                const headers = rawHeaders.map(h => String(h ?? '').trim()).filter(h => h.length > 0);

                if (sheetName === 'stationParts') {
                    const matchesStandard = fileFormat.expectedStationPartsHeaders.every((h, i) => headers[i] === h) &&
                        headers.length === fileFormat.expectedStationPartsHeaders.length;
                    const matchesWithAllowed = fileFormat.expectedStationPartsHeadersWithAllowed.every((h, i) => headers[i] === h) &&
                        headers.length === fileFormat.expectedStationPartsHeadersWithAllowed.length;

                    console.log("stationParts headers:", headers, "matches standard:", matchesStandard, "matches with allowed:", matchesWithAllowed);
                    if (!matchesStandard && !matchesWithAllowed) {
                        setError(`Sheet "${sheetName}" headers are incorrect or in wrong order.`);
                        setShowProgress(false);
                        return;
                    }
                    continue;
                }

                let expectedHeaders: String[] = [];
                switch (sheetName) {
                    case 'products':
                        expectedHeaders = fileFormat.expectedProductHeaders;
                        break;
                    case 'stations':
                        expectedHeaders = fileFormat.expectedStationsHeaders;
                        break;
                    case 'parts':
                        expectedHeaders = fileFormat.expectedPartsHeaders;
                        break;
                    case 'productPartExceptions':
                        expectedHeaders = fileFormat.expectedProductPartExceptionsHeaders;
                        break;
                    default:
                        expectedHeaders = [];
                }
                console.log("expected: ", expectedHeaders, "headers:", headers);
                if (
                    !expectedHeaders.every((h, i) => headers[i] === h) ||
                    headers.length !== expectedHeaders.length
                ) {
                    setError(`Sheet "${sheetName}" headers are incorrect or in wrong order.`);
                    setShowProgress(false);
                    return;
                }
            }

            // If all checks pass, proceed with upload
            await uploadFile(file, (progress: number) => {
                setUploadProgress(progress);
                progress === 100 && setShowProgress(false);
            });
            handleDialogClose();

            setTimeout(() => {
                alert(`${file.name} uploaded successfully!`);
                window.location.reload();
            }, 1000);

        } catch (err: any) {
            setError(`File validation error: ${err.message}`);
            setShowProgress(false);
        }
    };

    return (
        <Dialog open={fileUploadOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Upload Excel File</DialogTitle>
                    <DialogDescription>
                        Select the Excel file with the new data that you want to update
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    <div className='flex gap-2'>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                    border border-[#262626] rounded-md
                                    file:mr-4 file:h-10 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-gray-900 file:text-blue-500
                                    hover:file:bg-gray-800"
                        />
                        <Button
                            onClick={handleUploadClick}
                            disabled={showProgress}
                            className="w-fit bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Upload
                        </Button>
                    </div>
                    {showProgress && (
                        <Progress value={uploadProgress} className="h-2 rounded" />
                    )}
                    {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleDialogClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default FileUpload;
