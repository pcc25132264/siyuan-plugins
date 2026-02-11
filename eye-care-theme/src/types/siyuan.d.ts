declare module "siyuan" {
  export interface ICommand {
    langKey: string;
    langText?: string;
    hotkey?: string;
    customHotkey?: string;
    callback?: () => void;
    globalCallback?: () => void;
  }

  export interface IPluginSettingOption {
    title: string;
    description?: string;
    actionElement?: HTMLElement;
    direction?: "column" | "row";
    createActionElement?(): HTMLElement;
  }

  export class Setting {
    constructor(options: {
      height?: string;
      width?: string;
      destroyCallback?: () => void;
      confirmCallback?: () => void;
    });
    addItem(options: IPluginSettingOption): void;
    open(name: string): void;
  }

  export class Plugin {
    public i18n: Record<string, any>;
    public displayName: string;
    public readonly name: string;
    public setting: Setting;
    public onload(): Promise<void> | void;
    public onunload(): void;
    public addCommand(command: ICommand): void;
    public openSetting(): void;
    public loadData(storageName: string): Promise<any>;
    public saveData(storageName: string, data: any): Promise<any>;
    public removeData(storageName: string): Promise<any>;
  }

  export const showMessage: (message: string, timeout?: number, type?: "error" | "info") => void;
}
