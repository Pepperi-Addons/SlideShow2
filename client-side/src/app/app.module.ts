import { Component, DoBootstrap, Injector, NgModule, Type } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { PepAddonService } from '@pepperi-addons/ngx-lib';

import { SlideshowComponent, SlideshowModule } from './components/slideshow';
import { SlideshowEditorComponent, SlideshowEditorModule } from './components/slideshow-editor';

import { config } from './components/addon.config';

@Component({
    selector: 'app-empty-route',
    template: '<div>Route is not exist.</div>',
})
export class EmptyRouteComponent {}

const routes: Routes = [
    { path: '**', component: EmptyRouteComponent }
];

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        SlideshowModule,
        SlideshowEditorModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (addonService: PepAddonService) => 
                    PepAddonService.createMultiTranslateLoader(config.AddonUUID, addonService, ['ngx-lib', 'ngx-composite-lib']),
                deps: [PepAddonService]
            }
        }),
        RouterModule.forRoot(routes),
    ],
    providers: [],
    bootstrap: [
        // AppComponent
    ]
})
export class AppModule implements DoBootstrap {
    constructor(
        private injector: Injector,
        translate: TranslateService,
        private pepAddonService: PepAddonService
    ) {
        this.pepAddonService.setDefaultTranslateLang(translate);
    }

    private defineCustomElement(elementName: string, component: Type<any>) {
        if (!customElements.get(elementName)) {  
            customElements.define(elementName, createCustomElement(component, {injector: this.injector}));
        }
    }
    
    ngDoBootstrap() {
        this.defineCustomElement(`slideshow-element-${config.AddonUUID}`, SlideshowComponent);
        this.defineCustomElement(`slideshow-editor-element-${config.AddonUUID}`, SlideshowEditorComponent);
    }
}