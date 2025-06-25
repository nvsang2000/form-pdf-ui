import EditorJS, {
	type BlockTool,
	type API,
	type BlockToolConstructorOptions,
	type SanitizerConfig,
} from '@editorjs/editorjs';

import Paragraph from '@editorjs/paragraph';
import Header from '@editorjs/header';

// custom tools
import Underline from './Underline';
import Variable from './Variable';
import Signature from './Signature';

/** Interface cho dữ liệu Column */
interface ColumnData {
	blocks: unknown[];
}

/** Các tool dùng cho nested editor */
const nestedTools = {
	header: { class: Header as any, inlineToolbar: true },
	paragraph: { class: Paragraph as any, inlineToolbar: true },
	underline: { class: Underline, inlineToolbar: true },
	variable: { class: Variable, inlineToolbar: true },
	signature: { class: Signature },
} as const;

export default class Layout implements BlockTool {
	static get toolbox() {
		return {
			title: 'Layout',
			icon: `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 4h7v16H4zM13 4h7v16h-7z"/></svg>`,
		};
	}

	static get isReadOnlySupported(): boolean {
		return true;
	}

	static get shortcut(): string {
		return 'CMD+L';
	}

	static get sanitize(): SanitizerConfig {
		return {
			columns: {
				type: 'array',
				items: { type: 'object', properties: { blocks: { type: 'array' } } },
			},
		};
	}

	private api: API;
	private data: { columns: ColumnData[] };
	private container: HTMLDivElement;

	constructor({
		api,
		data,
	}: BlockToolConstructorOptions<{ columns: ColumnData[] }>) {
		this.api = api;
		this.data = {
			columns: Array.isArray(data?.columns)
				? data.columns.map((c) => ({ blocks: c.blocks || [] }))
				: [{ blocks: [] }, { blocks: [] }],
		};

		this.container = document.createElement('div');
		this.container.classList.add('layout-grid');
	}

	render(): HTMLElement {
		this.container.innerHTML = '';

		this.data.columns.forEach((col, idx) => {
			const colEl = document.createElement('div');
			colEl.className = 'layout-col';
			colEl.style.position = 'relative';

			if (col.blocks.length === 0) {
				const btn = document.createElement('button');
				btn.type = 'button';
				btn.textContent = 'Add Content';
				btn.classList.add('col-content-btn');
				btn.addEventListener('click', () => this.openNestedEditor(idx));
				colEl.appendChild(btn);
			} else {
				const holder = document.createElement('div');
				holder.className = 'col-preview-holder';
				colEl.appendChild(holder);

				new EditorJS({
					holder,
					readOnly: true,
					minHeight: 0,
					tools: nestedTools,
					data: { blocks: col.blocks, version: EditorJS.version },
				});

				const editOverlay = document.createElement('button');
				editOverlay.type = 'button';
				editOverlay.className = 'col-edit-overlay';
				editOverlay.innerHTML = '✏️';
				editOverlay.addEventListener('click', () => this.openNestedEditor(idx));
				colEl.appendChild(editOverlay);
			}

			this.container.appendChild(colEl);
		});

		return this.container;
	}

	/**
	 * Thêm cột mới tại vị trí xác định
	 */
	private addColumn(position: number): void {
		this.data.columns.splice(position, 0, { blocks: [] });
		this.render();
	}

	/**
	 * Xóa cột tại index (ít nhất 1 cột giữ lại)
	 */
	private deleteColumn(index: number): void {
		if (this.data.columns.length <= 1) {
			return;
		}
		this.data.columns.splice(index, 1);
		this.render();
	}

	/**
	 * Mở editor popup cho cột
	 */
	private openNestedEditor(columnIndex: number): void {
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

		const holder = overlay.querySelector<HTMLDivElement>('.popup-editor-holder')!;
		const nested = new EditorJS({
			holder,
			tools: nestedTools,
			autofocus: true,
			data: {
				blocks: this.data.columns[columnIndex].blocks,
				version: EditorJS.version,
			},
		});

		overlay.querySelector('.popup-cancel')!.addEventListener('click', () => {
			nested.destroy();
			overlay.remove();
		});

		overlay.querySelector('.popup-save')!.addEventListener('click', async () => {
			const output = await nested.save();
			nested.destroy();
			overlay.remove();
			this.data.columns[columnIndex].blocks = output.blocks;
			this.render();
		});
	}

	/**
	 * Lưu data của block (gọi bởi EditorJS)
	 */
	public save(blockContent: HTMLElement): { columns: ColumnData[] } {
		// trả về cấu trúc data để EditorJS ghi vào JSON
		return { columns: this.data.columns };
	}

	/**
	 * Validate data trước khi lưu
	 */
	public validate(savedData: any): boolean {
		return (
			Array.isArray(savedData?.columns) &&
			savedData.columns.every((c: any) => Array.isArray(c.blocks))
		);
	}
}
