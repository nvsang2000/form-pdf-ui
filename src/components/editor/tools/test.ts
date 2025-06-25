import EditorJS, {
	type BlockTool,
	type API,
	type BlockToolConstructorOptions,
	type OutputData,
	type SanitizerConfig,
} from '@editorjs/editorjs';

import Paragraph from '@editorjs/paragraph';
import Signature from './Signature';

/**
 * Định nghĩa các tool con cho nested editor.
 * Lưu ý: phải import ListTool & UnderlineTool từ @editorjs, không phải lucide.
 */
const nestedTools = {
	paragraph: { class: Paragraph as any, inlineToolbar: true },
	signature: { class: Signature },
} as const;

export default class Layout implements BlockTool {
	/** Hiển thị trong toolbox */
	static get toolbox() {
		return {
			title: 'Layout',
			icon: `<svg width="18" height="18" viewBox="0 0 24 24">
               <path d="M4 4h7v16H4zM13 4h7v16h-7z"/>
             </svg>`,
		};
	}

	/** Cho phép xem block này ở chế độ readOnly */
	static get isReadOnlySupported(): boolean {
		return true;
	}

	/** Shortcut để chèn block */
	static get shortcut(): string {
		return 'CMD+L';
	}

	/**
	 * Cấu hình sanitizer: chỉ chấp nhận mảng `columns`, mỗi phần tử
	 * là object có đúng trường `blocks` (mảng).
	 */
	static get sanitize(): SanitizerConfig {
		return {
			columns: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						blocks: { type: 'array' },
					},
				},
			},
		};
	}

	private api: API;
	private data: { columns: { blocks: unknown[] }[] };
	private container: HTMLDivElement;

	constructor({ api, data }: BlockToolConstructorOptions) {
		this.api = api;

		// Bình thường hóa input data: chỉ giữ lại trường blocks
		this.data = {
			columns: Array.isArray(data?.columns)
				? data.columns.map((c) => ({ blocks: c.blocks }))
				: [{ blocks: [] }, { blocks: [] }],
		};

		this.container = document.createElement('div');
		this.container.classList.add('layout-grid');
	}

	/** Vẽ grid các cột */
	render(): HTMLElement {
		this.container.innerHTML = '';

		this.data.columns.forEach((col, idx) => {
			const colEl = document.createElement('div');
			colEl.classList.add('layout-col');
			colEl.innerHTML = this.renderPreview(col.blocks);
			colEl.addEventListener('click', () => this.openNestedEditor(idx, colEl));
			this.container.appendChild(colEl);
		});

		return this.container;
	}

	/** Tạo preview đơn giản cho nội dung cột */
	private renderPreview(blocks: unknown[]): string {
		return (blocks as any[])
			.map((b) => {
				switch (b.type) {
					case 'header':
					case 'paragraph':
						return b.data.text;
					case 'list':
						return (b.data.items as string[]).join(', ');
					case 'image':
						return `<img src="${b.data.file.url}" style="max-height:40px" />`;
					default:
						return `[${b.type}]`;
				}
			})
			.join('<br>');
	}

	/**
	 * Mở nested EditorJS để edit cột thứ `columnIndex`
	 * - holder: dùng chính element `.popup-editor-holder` (HTMLElement)
	 * - tools: nestedTools đã validate
	 */
	private openNestedEditor(columnIndex: number, hostEl: HTMLElement): void {
		// Tạo overlay + popup
		const overlay = document.createElement('div');
		overlay.classList.add('editor-popup-overlay');
		overlay.innerHTML = `
      <div class="editor-popup">
        <div class="popup-editor-holder"></div>
        <div class="popup-actions">
          <button type="button" class="popup-cancel">Cancel</button>
          <button type="button" class="popup-save">Save</button>
        </div>
      </div>
    `;
		document.body.appendChild(overlay);

		// Lấy holder element trực tiếp (HTMLElement) thay vì id
		const holder = overlay.querySelector<HTMLDivElement>('.popup-editor-holder')!;

		const nested = new EditorJS({
			holder,
			data: { blocks: this.data.columns[columnIndex].blocks },
			tools: nestedTools,
			autofocus: true,
			onReady: () => {
				// Cancel: huỷ popup
				overlay
					.querySelector<HTMLButtonElement>('.popup-cancel')!
					.addEventListener('click', () => {
						nested.destroy();
						overlay.remove();
					});

				// Save: lấy blocks mới, cập nhật data và preview, destroy + remove
				overlay
					.querySelector<HTMLButtonElement>('.popup-save')!
					.addEventListener('click', async () => {
						const { blocks } = await nested.save(); // nested.save() trả về { time, blocks, version }
						this.data.columns[columnIndex] = { blocks }; // chỉ giữ lại blocks
						hostEl.innerHTML = this.renderPreview(blocks);
						nested.destroy();
						overlay.remove();
					});
			},
		});
	}

	/**
	 * EditorJS cha gọi để lấy data của LayoutBlock
	 */
	save(): Promise<{ columns: { blocks: unknown[] }[] }> {
		// Trả về đúng shape đã sanitize
		return Promise.resolve({ columns: this.data.columns });
	}

	/** Validate trước khi save */
	validate(savedData: any): boolean {
		return (
			Array.isArray(savedData?.columns) &&
			savedData.columns.every((c: any) => Array.isArray(c.blocks))
		);
	}
}
