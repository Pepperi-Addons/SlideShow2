import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { PepSelectModule } from '@pepperi-addons/ngx-lib/select';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepHttpService, PepFileService, PepNgxLibModule, PepAddonService, PepCustomizationService } from '@pepperi-addons/ngx-lib';
import { PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { PepPageLayoutModule } from '@pepperi-addons/ngx-lib/page-layout';
import { pepIconArrowBackRight, PepIconModule, PepIconRegistry, pepIconSystemPause , pepIconSystemPlay, pepIconArrowLeft, pepIconArrowRight, pepIconSystemCircle} from '@pepperi-addons/ngx-lib/icon';

import { config } from '../addon.config';

import { SlideshowComponent } from './slideshow.component';
import { SlideModule } from '../slide/slide.module';
import { HammerModule } from '@angular/platform-browser';

const pepIcons = [
    pepIconArrowBackRight,
    pepIconSystemPlay,
    pepIconSystemPause,
    pepIconArrowLeft,
    pepIconArrowRight,
    pepIconSystemCircle,
]
@NgModule({
    declarations: [
        SlideshowComponent,
        // PepperiTableComponent
    ],
    imports: [
        CommonModule,
        SlideModule,
        PepNgxLibModule,
        PepButtonModule,
        PepSelectModule,
        PepPageLayoutModule,
        PepIconModule,
        HammerModule,
        // When not using module as sub-addon please remark this for not loading twice resources
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: (addonService: PepAddonService) => 
                    PepAddonService.createMultiTranslateLoader(config.AddonUUID, addonService, ['ngx-lib', 'ngx-composite-lib']),
                deps: [PepAddonService]
            }, isolate: false
        })
    ],
    exports:[SlideshowComponent],
    providers: [
        TranslateStore,
    ]
})
export class SlideshowModule {
    constructor(
        translate: TranslateService,
        private pepIconRegistry: PepIconRegistry,
        private addonService: PepAddonService,
    ) {
        this.addonService.setDefaultTranslateLang(translate);
        this.pepIconRegistry.registerIcons(pepIcons);
    }
}
