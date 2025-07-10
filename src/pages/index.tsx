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
import axios from 'axios';

export default function EditorPage() {
	const signaturePadRef = useRef<SignaturePad | null>(null);
	const editorRef = useRef<EditorHandle>(null);

	const handleSaveFromOutside = () => {
		const base64 = signaturePadRef.current?.toDataURL();
		if (base64) {
			console.log('Chữ ký từ ngoài:', base64);
		}
	};

	const handleClearFromOutside = () => {
		signaturePadRef.current?.clear();
	};

	async function fetchDataPdf(data) {
		try {
			const payload = {
				width: 600,
				height: 900,
				margin: 10,
				content: JSON.stringify(data),
			};

			// Sử dụng import.meta.env nếu bạn đang chạy với Vite
			//const endpoint = process.env.VITE_SERVICE_ENDPOINT as string;

			// Gọi API bằng POST
			const res = await axios.post(
				`http://localhost:35000/editor/convert/jsontopdf`,
				payload,
				{
					headers: { 'Content-Type': 'application/json' },
				},
			);

			console.log('res.data', res.data);

			// Trả về dữ liệu
		} catch (err: any) {
			// Bỏ qua khi request bị huỷ (nếu dùng axios cancel token)
			console.log('err', err);
			if (axios.isCancel(err)) return;
		}
	}

	return (
		<div className="container mx-auto p-5">
			<div className="pt-[60px] pb-[60px]">
				<FormEditor
					className="w-full"
					tunes={['alignText']}
					toolBar={[...InlineToolBarDefault, 'variable']}
					ref={editorRef}
					initialData={DATA}
					onChange={(data) => {}}
				/>

				<div className="mt-[40px] flex">
					<Button
						className="mr-[10px]"
						onClick={async () => {
							const data = await editorRef.current?.save();
							await fetchDataPdf(data);
						}}
					>
						Save
					</Button>

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
		</div>
	);
}
