import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import SignatureCanvas from 'react-signature-canvas';
import { PDFDocument } from 'pdf-lib';
import '@react-pdf-viewer/core/lib/styles/index.css';
import './index.css';

interface PdfSignerLastPageDynamicProps {
	pdfUrl: string;
	workerUrl?: string;
}

type SignatureCanvasRef = SignatureCanvas | null;

const PdfSignerLastPageDynamic: React.FC<PdfSignerLastPageDynamicProps> = ({
	pdfUrl,
	workerUrl,
}) => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const sigCanvasRef = useRef<SignatureCanvasRef>(null);

	const decodeBase64 = (dataUri: string): Uint8Array => {
		const base64 = dataUri.split(',')[1] || dataUri;
		const binary = atob(base64);
		const len = binary.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes;
	};

	const [fileData, setFileData] = useState<Uint8Array>(() =>
		decodeBase64(pdfUrl),
	);
	const [pdfSrc, setPdfSrc] = useState<string>(() => {
		const bytes = decodeBase64(pdfUrl) as any;
		return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
	});

	useEffect(() => {
		return () => URL.revokeObjectURL(pdfSrc);
	}, [pdfSrc]);

	useEffect(() => {
		const bytes = decodeBase64(pdfUrl) as any;
		setFileData(bytes);
		setPdfSrc((prev) => {
			URL.revokeObjectURL(prev);
			return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
		});
	}, [pdfUrl]);

	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const handleSignClick = () => setModalOpen(true);
	const handleClear = () => sigCanvasRef.current?.clear();

	const handleSave = async () => {
		if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
			alert('Please sign before saving');
			return;
		}
		const sigDataUrl = sigCanvasRef.current.toDataURL('image/png');

		try {
			const pdfDoc = await PDFDocument.load(fileData);
			const pages = pdfDoc.getPages();
			const lastPage = pages[pages.length - 1] as any;
			const pngImage = await pdfDoc.embedPng(sigDataUrl);
			const { width: pdfWidth, height: pdfHeight } = lastPage.getSize();

			let placed = false;
			const container = containerRef.current;
			if (container) {
				const pageEls = container.querySelectorAll('.rpv-core__page');
				if (pageEls.length) {
					const lastEl = pageEls[pageEls.length - 1] as HTMLElement;
					const textLayer = lastEl.querySelector(
						'.rpv-core__text-layer',
					) as HTMLElement;
					if (textLayer) {
						let maxBottom = -Infinity;
						let targetSpan: HTMLElement | null = null;
						textLayer.querySelectorAll('span').forEach((span) => {
							const rect = (span as HTMLElement).getBoundingClientRect();
							if (rect.bottom > maxBottom) {
								maxBottom = rect.bottom;
								targetSpan = span as HTMLElement;
							}
						});
						if (targetSpan) {
							const spanRect = targetSpan.getBoundingClientRect();
							const pageRect = lastEl.getBoundingClientRect();
							const cssX = spanRect.right - pageRect.left + 10;
							const cssYFromTop = spanRect.bottom - pageRect.top + 5;
							const x = cssX * (pdfWidth / pageRect.width);
							const y =
								(pageRect.height - cssYFromTop) * (pdfHeight / pageRect.height);
							const sigW = 400;
							const sigH = (pngImage.height / pngImage.width) * sigW;
							lastPage.drawImage(pngImage, { x, y, width: sigW, height: sigH });
							placed = true;
						}
					}
				}
			}
			if (!placed) {
				const sigW = 150;
				const sigH = (pngImage.height / pngImage.width) * sigW;
				lastPage.drawImage(pngImage, {
					x: pdfWidth - sigW - 40,
					y: 40,
					width: sigW,
					height: sigH,
				});
			}

			const newBytes = await pdfDoc.save();
			const newUint8 = new Uint8Array(newBytes);
			setFileData(newUint8);
			setPdfSrc((prev) => {
				URL.revokeObjectURL(prev);
				return URL.createObjectURL(
					new Blob([newUint8], { type: 'application/pdf' }),
				);
			});
			setModalOpen(false);
		} catch (err) {
			console.error('Error saving signature:', err);
			alert('An error occurred while saving the signature. Please try again.');
		}
	};

	return (
		<div
			ref={containerRef}
			style={{ position: 'relative', width: '100%', height: '100vh' }}
		>
			<Worker
				workerUrl={
					workerUrl || 'https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'
				}
			>
				<Viewer fileUrl={pdfSrc} defaultScale={SpecialZoomLevel.PageFit} />
			</Worker>

			<button
				onClick={handleSignClick}
				style={{
					position: 'absolute',
					bottom: 60,
					left: '50%',
					transform: 'translateX(-50%)',
					zIndex: 10,
					padding: '8px 16px',
					borderRadius: 4,
					border: 'none',
					background: '#007bff',
					color: '#fff',
					cursor: 'pointer',
				}}
			>
				Signature
			</button>

			{modalOpen &&
				createPortal(
					<div
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							width: '100vw',
							height: '100vh',
							background: 'rgba(0,0,0,0.3)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							zIndex: 1000,
						}}
					>
						<div
							style={{
								background: '#fff',
								padding: 16,
								borderRadius: 8,
								boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
							}}
						>
							<SignatureCanvas
								ref={sigCanvasRef}
								canvasProps={{
									width: 600,
									height: 400,
									style: { border: '1px solid #ccc' },
								}}
							/>
							<div className="signature-modal-footer">
								<button
									className="signature-btn signature-btn-save"
									onClick={handleSave}
								>
									Save
								</button>
								<button
									className="signature-btn signature-btn-clear"
									onClick={handleClear}
								>
									Clear
								</button>
								<button
									className="signature-btn signature-btn-cancel"
									onClick={() => setModalOpen(false)}
								>
									Cancel
								</button>
							</div>
						</div>
					</div>,
					document.body!,
				)}
		</div>
	);
};

export default PdfSignerLastPageDynamic;
