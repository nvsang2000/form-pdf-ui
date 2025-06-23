import EditorJS, {
	type BlockTool,
	type API,
	type BlockToolConstructorOptions,
	type OutputData,
	type SanitizerConfig,
} from '@editorjs/editorjs';
import ImageTool from '@editorjs/image';
import InlineCode from '@editorjs/inline-code';
import AlignText from './AlignText';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import { List, Underline } from 'lucide-react';

const toolsConfig = {
	inlineCode: InlineCode,
	image: ImageTool,
	alignText: AlignText as any,
	header: { class: Header as any, inlineToolbar: true },
	paragraph: { class: Paragraph as any, inlineToolbar: true },
	list: { class: List as any, inlineToolbar: true },
	underline: { class: Underline, inlineToolbar: true },
} as any;

export default class LayoutBlock implements BlockTool {
	private api: API;
	private data: { columns: OutputData[] };
	private container: HTMLDivElement;

	constructor({ api, data }: BlockToolConstructorOptions) {
		this.api = api;
		this.data = {
			columns: Array.isArray(data?.columns)
				? data.columns
				: [{ blocks: [] }, { blocks: [] }],
		};

		this.container = document.createElement('div');
		this.container.classList.add('layout-grid');
	}

	public render(): HTMLElement {
		this.container.innerHTML = '';

		this.data.columns.forEach((colData, index) => {
			const col = document.createElement('div');
			col.classList.add('layout-col');
			col.textContent = 'Click to edit';

			col.addEventListener('click', () => this.openPopup(index, col));
			this.container.appendChild(col);
		});

		return this.container;
	}

	private openPopup(index: number, colElement: HTMLElement): void {
		const popup = document.createElement('div');
		popup.classList.add('editor-popup-overlay');

		popup.innerHTML = `
      <div class="editor-popup">
        <div id="popup-editor" class="popup-editor-holder"></div>
        <div class="popup-actions">
          <button id="popup-cancel">Cancel</button>
		   <button id="popup-save">Save</button>
        </div>
      </div>
    `;

		document.body.appendChild(popup);

		const popupEditor = new EditorJS({
			holder: 'popup-editor',
			data: this.data.columns[index] || { blocks: [] },
			tools: toolsConfig,
			autofocus: true,
			onReady: () => {
				document.getElementById('popup-cancel')?.addEventListener('click', () => {
					popup.remove();
				});
				document
					.getElementById('popup-save')
					?.addEventListener('click', async () => {
						const saved = await popupEditor.save();
						this.data.columns[index] = saved;
						colElement.innerHTML = saved.blocks.map((b) => b.data.text).join('<br>');
						popup.remove();
					});
			},
		});
	}

	public async save(): Promise<{ columns: OutputData[] }> {
		return { columns: this.data.columns };
	}

	public validate(savedData: any): boolean {
		return Array.isArray(savedData?.columns);
	}

	public static get toolbox() {
		return {
			title: 'Layout',
			icon: `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 4h7v16H4zM13 4h7v16h-7z"/></svg>`,
		};
	}

	public static get sanitize(): SanitizerConfig {
		return {
			columns: {},
		};
	}
}
