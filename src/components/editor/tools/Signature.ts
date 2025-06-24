import '../style/index.css';
import type {
	BlockTool,
	BlockToolConstructorOptions,
	SanitizerConfig,
} from '@editorjs/editorjs';
import SignaturePad from 'signature_pad';

/**
 * Data shape giống Image Tool của Editor.js
 */
export interface SignatureImageData {
	url?: string;
	caption: string;
	withBorder: boolean;
	stretched: boolean;
	withBackground: boolean;
}

export default class SignatureAsImage implements BlockTool {
	/**
	 * Hiển thị trên toolbar dưới key "image" sẽ cho block.type = "image"
	 */
	static get toolbox() {
		return {
			title: 'Signature',
			icon: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 22l19.5-9L2 4v7l15.5 2L2 15z"/>
        </svg>`,
		};
	}

	/** Cho phép ở chế độ read-only */
	static get isReadOnlySupported(): boolean {
		return true;
	}

	/**
	 * SanitizerConfig giống Image Tool
	 */
	static get sanitize(): SanitizerConfig {
		return {
			url: false,
			caption: { html: true },
			withBorder: { type: 'boolean' },
			stretched: { type: 'boolean' },
			withBackground: { type: 'boolean' },
		};
	}

	private data: SignatureImageData;
	private wrapper!: HTMLElement;
	private pad?: SignaturePad;

	constructor({
		data,
	}: BlockToolConstructorOptions<Partial<SignatureImageData>>) {
		this.data = {
			url: data?.url,
			caption: data?.caption || '',
			withBorder: !!data?.withBorder,
			stretched: !!data?.stretched,
			withBackground: !!data?.withBackground,
		};
	}

	render(): HTMLElement {
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add('signature-image-block');
		this.redraw();
		return this.wrapper;
	}

	private redraw(): void {
		this.wrapper.innerHTML = '';

		if (this.data.url) {
			const img = document.createElement('img');
			img.src = this.data.url;
			img.classList.add('signature-image');
			this.wrapper.appendChild(img);
			this.wrapper.appendChild(
				this.createButton('Edit Signature', 'btn-edit', () => this.openCanvas()),
			);
		} else {
			this.wrapper.appendChild(
				this.createButton('Add Signature', 'btn-add', () => this.openCanvas()),
			);
		}
	}

	private openCanvas(): void {
		this.wrapper.innerHTML = '';

		const canvas = document.createElement('canvas');
		canvas.width = 400;
		canvas.height = 400;
		canvas.classList.add('signature-canvas');
		this.wrapper.appendChild(canvas);

		this.pad = new SignaturePad(canvas);
		if (this.data.url) {
			this.pad.fromDataURL(this.data.url);
		}

		const controls = document.createElement('div');
		controls.classList.add('signature-controls');
		controls.appendChild(
			this.createButton('Save', 'btn-save', () => this.onSave()),
		);
		controls.appendChild(
			this.createButton('Clear', 'btn-clear', () => this.pad?.clear()),
		);
		controls.appendChild(
			this.createButton('Cancel', 'btn-cancel', () => this.redraw()),
		);
		this.wrapper.appendChild(controls);
	}

	private onSave(): void {
		if (this.pad && !this.pad.isEmpty()) {
			this.data.url = this.pad.toDataURL();
		} else {
			this.data.url = undefined;
		}
		this.redraw();
	}

	private createButton(
		text: string,
		className: string,
		onClick: () => void,
	): HTMLButtonElement {
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.textContent = text;
		btn.classList.add('signature-btn', className);
		btn.addEventListener('click', onClick);
		return btn;
	}

	/** Trả về data giống Image Tool */
	save(): SignatureImageData {
		return {
			url: this.data.url,
			caption: this.data.caption,
			withBorder: this.data.withBorder,
			stretched: this.data.stretched,
			withBackground: this.data.withBackground,
		};
	}

	validate(data: SignatureImageData): boolean {
		return data.url === undefined || typeof data.url === 'string';
	}
}
