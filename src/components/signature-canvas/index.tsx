import React, {
	useRef,
	useEffect,
	useImperativeHandle,
	forwardRef,
} from 'react';
import SignaturePad from 'signature_pad';

export type SignaturePadRef = {
	clear: () => void;
	save: () => string | null;
};

type Props = {
	width?: number;
	height?: number;
	onSave?: (dataUrl: string) => void;
};

const SignatureCanvas = forwardRef<SignaturePadRef, Props>(
	({ width = 400, height = 200, onSave }, ref) => {
		const canvasRef = useRef<HTMLCanvasElement>(null);
		const padRef = useRef<SignaturePad | null>(null);

		useEffect(() => {
			const canvas = canvasRef.current;
			if (canvas) {
				padRef.current = new SignaturePad(canvas);
			}
		}, []);

		useImperativeHandle(ref, () => ({
			clear() {
				padRef.current?.clear();
			},
			save() {
				if (padRef.current?.isEmpty()) return null;
				return padRef.current.toDataURL();
			},
		}));

		const handleClear = () => {
			padRef.current?.clear();
		};

		const handleSave = () => {
			if (padRef.current?.isEmpty()) {
				alert('Chưa có chữ ký!');
				return;
			}
			const dataUrl = padRef.current.toDataURL();
			onSave?.(dataUrl);
		};

		return (
			<div className="w-full max-w-md rounded border p-4 shadow">
				<canvas
					ref={canvasRef}
					width={width}
					height={height}
					className="rounded border border-gray-400"
				/>
				<div className="mt-3 flex gap-2">
					<button
						onClick={handleClear}
						className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
					>
						Xóa
					</button>
					<button
						onClick={handleSave}
						className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Lưu
					</button>
				</div>
			</div>
		);
	},
);

export default SignatureCanvas;
