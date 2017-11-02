import { WidgetLibraryService } from '../widget-library/widget-library.service';
export declare type Framework = {
    framework: any;
    widgets?: {
        [key: string]: any;
    };
    stylesheets?: string[];
    scripts?: string[];
};
export declare type FrameworkLibrary = {
    [key: string]: Framework;
};
export declare class FrameworkLibraryService {
    private widgetLibrary;
    activeFramework: Framework;
    stylesheets: (HTMLStyleElement | HTMLLinkElement)[];
    scripts: HTMLScriptElement[];
    loadExternalAssets: boolean;
    defaultFramework: string;
    frameworkLibrary: FrameworkLibrary;
    constructor(widgetLibrary: WidgetLibraryService);
    registerFrameworkWidgets(framework: Framework): boolean;
    setLoadExternalAssets(loadExternalAssets?: boolean): void;
    setFramework(framework?: string | Framework, loadExternalAssets?: boolean): boolean;
    hasFramework(type: string): boolean;
    getFramework(): any;
    getFrameworkWidgets(): any;
    getFrameworkStylesheets(load?: boolean): string[];
    getFrameworkScripts(load?: boolean): string[];
}
