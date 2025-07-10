import './index.css';
import type { BlockTool, SanitizerConfig } from '@editorjs/editorjs';
import SignaturePad from 'signature_pad';

export interface SignatureImageData {
	url?: string;
	caption: string;
	withBorder: boolean;
	stretched: boolean;
	withBackground: boolean;
}

export default class SignatureAsImage implements BlockTool {
	static get toolbox() {
		return {
			title: 'Signature',
			icon: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M2 22l19.5-9L2 4v7l15.5 2L2 15z"/>
        </svg>`,
		};
	}

	static get isReadOnlySupported(): boolean {
		return true;
	}

	static get sanitize(): SanitizerConfig {
		return {
			url: false,
			caption: { html: true },
			withBorder: { type: 'boolean' },
			stretched: { type: 'boolean' },
			withBackground: { type: 'boolean' },
		};
	}

	private data: { url?: string };
	private wrapper!: HTMLElement;
	private api: any;
	private pad?: SignaturePad;

	constructor({ data, api }: { data: { url?: string }; api: any }) {
		this.api = api;
		this.data = data || {};
	}

	// render(): HTMLElement {
	// 	this.wrapper = document.createElement('div');

	// 	const button = document.createElement('button');
	// 	button.innerText = this.data.url ? 'Chỉnh sửa chữ ký' : 'Thêm chữ ký';
	// 	button.onclick = () => this.openModal();

	// 	this.wrapper.appendChild(button);

	// 	if (this.api?.readOnly?.isEnabled && this.data?.url) {
	// 		const img = document.createElement('img');
	// 		img.src = this.data.url;
	// 		img.style.maxWidth = '100%';
	// 		img.style.border = '1px solid #ccc';
	// 		this.wrapper.appendChild(img);
	// 		return this.wrapper;
	// 	}

	// 	// Gắn lại ảnh chữ ký nếu có
	// 	if (this.data?.url) {
	// 		const img = document.createElement('img');
	// 		img.src = this.data.url;
	// 		img.style.maxWidth = '200px';
	// 		img.style.marginTop = '10px';
	// 		this.wrapper.appendChild(img);
	// 	}
	// 	console.log('🔍 signature readOnly?', this.api.readOnly?.isEnabled);
	// 	console.log('📦 signature data:', this.data);

	// 	return this.wrapper;
	// }

	// private redraw() {
	// 	this.wrapper.innerHTML = '';
	// 	if (this.data.url) {
	// 		// Nếu đã có chữ ký, hiển thị ảnh + nút Edit
	// 		const img = document.createElement('img');
	// 		img.src = this.data.url;
	// 		img.classList.add('signature-image');
	// 		this.wrapper.appendChild(img);

	// 		this.wrapper.dataset.signatureUrl = this.data.url || '';
	// 		this.wrapper.appendChild(
	// 			this.createButton('Edit Signature', 'btn-edit', () => this.openModal()),
	// 		);
	// 	} else {
	// 		// Chưa có chữ ký, hiển thị nút Add
	// 		this.wrapper.appendChild(
	// 			this.createButton('Add Signature', 'btn-add', () => this.openModal()),
	// 		);
	// 	}
	// }

	render(): HTMLElement {
		this.wrapper = document.createElement('div');
		this.wrapper.className = 'signature-block';

		console.log('✅ render url =', this.data.url?.slice(0, 40));

		// Nếu có ảnh
		if (this.data?.url) {
			const img = document.createElement('img');
			img.src = this.data.url;
			img.style.maxWidth = '100%';
			img.onload = () => console.log('✅ Image loaded OK');
			img.onerror = (e) => console.error('❌ Image load failed', e);
			this.wrapper.appendChild(img);
		}

		const button = document.createElement('button');
		button.innerText = this.data?.url ? 'Cập nhật chữ ký' : 'Thêm chữ ký';
		button.onclick = () => this.openModal();
		this.wrapper.appendChild(button);

		return this.wrapper;
	}

	private openModal() {
		const overlay = document.createElement('div');
		overlay.className = 'signature-modal';
		overlay.style.cssText = `
			position: fixed; top: 0; left: 0; right: 0; bottom: 0;
			background: rgba(0,0,0,0.5); display: flex;
			justify-content: center; align-items: center; z-index: 9999;
		`;

		const modal = document.createElement('div');
		modal.style.cssText = `
			background: white; padding: 20px; border-radius: 8px;
			box-shadow: 0 0 10px rgba(0,0,0,0.2);
		`;

		const canvas = document.createElement('canvas');
		canvas.width = 500;
		canvas.height = 200;
		canvas.style.border = '1px solid #ccc';
		modal.appendChild(canvas);

		this.pad = new SignaturePad(canvas);
		if (this.data?.url) {
			this.pad.fromDataURL(this.data.url);
		}

		const btnSave = document.createElement('button');
		btnSave.innerText = 'Lưu';
		btnSave.onclick = () => {
			if (this.pad && !this.pad.isEmpty()) {
				this.data.url = this.pad.toDataURL();
			}
			document.body.removeChild(overlay);
			// 🔁 cập nhật lại UI
			const newWrapper = this.render();
			this.wrapper.replaceWith(newWrapper);
			this.wrapper = newWrapper;
		};

		const btnClear = document.createElement('button');
		btnClear.innerText = 'Xóa';
		btnClear.onclick = () => this.pad?.clear();

		const btnCancel = document.createElement('button');
		btnCancel.innerText = 'Hủy';
		btnCancel.onclick = () => document.body.removeChild(overlay);

		const controls = document.createElement('div');
		controls.style.marginTop = '10px';
		controls.append(btnSave, btnClear, btnCancel);
		modal.appendChild(controls);

		overlay.appendChild(modal);
		document.body.appendChild(overlay);
	}

	save(): { url?: string } {
		console.log('📦 save() called, returning url:', this.data.url?.slice(0, 40));
		return this.data?.url ? { url: this.data.url } : {};
	}

	validate(data: { url?: string }): boolean {
		return !data.url || typeof data.url === 'string';
	}
}
