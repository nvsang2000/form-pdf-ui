import {
	FormEditor,
	InlineToolBarDefault,
	type EditorHandle,
} from '@/components/editor';
import { useRef } from 'react';
import { DATA } from '@/constant';
import SignaturePad from 'signature_pad';
import SignatureCanvas from '@/components/signature-canvas';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTrigger,
} from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';

export default function EditorPage() {
	const signaturePadRef = useRef<SignaturePad | null>(null);
	const editorRef = useRef<EditorHandle>(null);

	const handleSaveFromOutside = () => {
		const base64 = signaturePadRef.current?.save();
		if (base64) {
			console.log('Chữ ký từ ngoài:', base64);
		}
	};

	const handleClearFromOutside = () => {
		signaturePadRef.current?.clear();
	};

	return (
		<div className="container mx-auto p-5">
			<div className="pt-[60px] pb-[60px]">
				<FormEditor
					className="w-full"
					tunes={['alignText']}
					toolBar={[...InlineToolBarDefault, 'variable', 'layout']}
					ref={editorRef}
					initialData={DATA}
					onChange={(data) => {
						console.log('change data', data);
					}}
				/>

				{/* <button
					className="mt-4 rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
					onClick={async () => {
						const data = await editorRef.current?.save();
						console.log('Đã lưu:', data);
					}}
				>
					Save
				</button> */}

				<Dialog>
					<form>
						<DialogTrigger asChild>
							<Button variant="outline">Signature</Button>
						</DialogTrigger>
						<DialogContent>
							<SignatureCanvas
								ref={signaturePadRef}
								height={500}
								width={400}
								onSave={(data) => console.log('data', data)}
							/>
							<DialogFooter>
								<Button onClick={handleClearFromOutside} variant="outline">
									Clear
								</Button>
								<Button onClick={handleSaveFromOutside}>Save</Button>
							</DialogFooter>
						</DialogContent>
					</form>
				</Dialog>
			</div>
		</div>
	);
}
