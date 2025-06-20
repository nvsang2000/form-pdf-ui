// components/SignatureDrawer.tsx
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
	DrawerFooter,
	DrawerClose,
} from '@repo/ui/drawer';
import { Button } from '@repo/ui/button';
import { useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';

interface Props {
	onSave?: (dataUrl: string) => void;
}

export default function SignatureDrawer({ onSave }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const signaturePadRef = useRef<SignaturePad | null>(null);

	useEffect(() => {
		if (canvasRef.current) {
			signaturePadRef.current = new SignaturePad(canvasRef.current);
		}
	}, []);

	const handleSave = () => {
		if (!signaturePadRef.current?.isEmpty()) {
			const dataUrl = signaturePadRef.current.toDataURL();
			onSave?.(dataUrl);
		} else {
			alert('Bạn chưa ký tên!');
		}
	};

	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant="outline">Ký tên</Button>
			</DrawerTrigger>
			<DrawerContent className="p-4">
				<DrawerHeader>
					<DrawerTitle>Ký tên điện tử</DrawerTitle>
				</DrawerHeader>
				<div className="flex flex-col items-center gap-4">
					<canvas
						ref={canvasRef}
						width={400}
						height={200}
						className="rounded border border-gray-400"
					/>
					<div className="flex gap-2">
						<Button
							variant="secondary"
							onClick={() => signaturePadRef.current?.clear()}
						>
							Xóa
						</Button>
						<Button onClick={handleSave}>Lưu</Button>
					</div>
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button variant="ghost">Đóng</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
