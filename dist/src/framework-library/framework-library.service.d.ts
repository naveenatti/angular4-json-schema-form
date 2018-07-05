import { WidgetLibraryService } from '../widget-library/widget-library.service';
export interface Framework {
    framework: any;
    widgets?: {
        [key: string]: any;
    };
    stylesheets?: string[];
    scripts?: string[];
}
export interface FrameworkLibrary {
    [key: string]: Framework;
}
export declare class FrameworkLibraryService {
    private widgetLibrary;
    activeFramework: Framework;
    stylesheets: (HTMLStyleElement | HTMLLinkElement)[];
    scripts: HTMLScriptElement[];
    loadExternalAssets: boolean;
    defaultFramework: string;
    frameworkLibrary: FrameworkLibrary;
    constructor(widgetLibrary: WidgetLibraryService);
    setLoadExternalAssets(loadExternalAssets?: boolean): void;
    setFramework(framework?: string | Framework, loadExternalAssets?: boolean): boolean;
    registerFrameworkWidgets(framework: Framework): boolean;
    hasFramework(type: string): boolean;
    getFramework(): any;
    getFrameworkWidgets(): any;
    getFrameworkStylesheets(load?: boolean): string[];
    getFrameworkScripts(load?: boolean): string[];
}
