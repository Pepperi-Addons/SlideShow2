import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PepStyleType} from '@pepperi-addons/ngx-lib';
import { PepButton } from '@pepperi-addons/ngx-lib/button';
import { ISlideShow, ISlideshowEditor, TransitionType, ISlideEditor, IHostObject } from '../slideshow.model';
import { Page, PageConfiguration } from '@pepperi-addons/papi-sdk';
//import { PepAddonBlockLoaderService } from '@pepperi-addons/ngx-lib/remote-loader';
//import { SlideshowService } from 'src/services/slideshow.service';
import { FlowService } from 'src/services/flow.service';

@Component({
    selector: 'slideshow-editor',
    templateUrl: './slideshow-editor.component.html',
    styleUrls: ['./slideshow-editor.component.scss']
})
export class SlideshowEditorComponent implements OnInit {
    
    @ViewChild('availableSlidesContainer', { read: ElementRef }) availableBlocksContainer: ElementRef;

    @Input()
    set hostObject(value: IHostObject) {
        if (value && value.configuration && Object.keys(value.configuration).length > 0) {
            this._configuration = value.configuration

            if(value.configurationSource && Object.keys(value.configuration).length > 0){
                    this.configurationSource = value.configurationSource;
            }

            this.flowHostObject = this.flowService.prepareFlowHostObject((value.configuration.SlideshowConfig?.OnLoadFlow || null));
        } else {
            if(this.blockLoaded){
                this.loadDefaultConfiguration();
            }
        }

        this.initPageConfiguration(value?.pageConfiguration);
        this._page = value?.page;
        this.flowService.recalculateEditorData(this._page, this._pageConfiguration); 
    }

    private _page: Page;
    get page(): Page {
        return this._page;
    }

    // the source config used to do if need to show the Reset button or not
    public configurationSource: ISlideShow;

    private _configuration: ISlideShow;
    get configuration(): ISlideShow {
        return this._configuration;
    }

    private defaultPageConfiguration: PageConfiguration = { "Parameters": [] };
    private _pageConfiguration: PageConfiguration = this.defaultPageConfiguration;

    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    blockLoaded = false;

    transitionTypes: Array<{key: TransitionType, value: string}> = [];
    buttonStyle: Array<{key: PepStyleType, value: string}> = [];
    buttonColor: Array<PepButton> = [];
    DropShadowStyle: Array<PepButton> = [];

    ArrowsType: Array<PepButton> = [];
    controllersDisplayTypes: Array<PepButton> = [];
    arrowsDisplayTypes: Array<PepButton> = [];
    ArrowButtons: Array<PepButton> = [];
    ControllerSize: Array<PepButton> = [];
    
    currentSlideindex = 0;
    
    public flowHostObject;

    constructor(private translate: TranslateService,
                private flowService: FlowService
                //private viewContainerRef: ViewContainerRef,
                //private slideshowService: SlideshowService,
                /*private addonBlockLoaderService: PepAddonBlockLoaderService*/) { 

    }

    private loadDefaultConfiguration() {
        this._configuration = this.getDefaultHostObject();
        this.updateHostObject();
    }

    private getDefaultSlide() {
        let arr: Array<ISlideEditor> = [];
        
        for(let i = 0 ; i < 2 ; i++){
            arr.push(new ISlideEditor());
            arr[i].id = i;
            arr[i].Title.Content = this.getOrdinal(i+1) + this.translate.instant('SLIDE_EDITOR.TITLE');
        }

        return arr;
    }

    getOrdinal(n) {
        var s = ["th ", "st ", "nd ", "rd "];
        var v = n%100;
        return n + (s[(v-20)%10] || s[v] || s[0]);
    }

    private getDefaultHostObject(): ISlideShow {
        return { SlideshowConfig: new ISlideshowEditor(), Slides: this.getDefaultSlide() };
    }

    public onHostObjectChange(event) {
        if(event && event.action){
            if(event.action === 'set-configuration'){
                this._configuration = event.configuration;
                this.updateHostObject();
            }
            if(event.action === 'set-configuration-field'){
                //this._configuration = event.configuration;
                this.updateHostObjectField(event.key, event.value);
            }
            // Update page configuration only if updatePageConfiguration
            if (event.updatePageConfiguration) {
                this.updatePageConfigurationObject();
            }
            
        }
    }

    private updateHostObject() {
        
        this.hostEvents.emit({
            action: 'set-configuration',
            configuration: this.configuration
        });
    }

    onSlideshowFieldChange(key, event){

        const value = event && event.source && event.source.key ? event.source.key : event && event.source && event.source.value ? event.source.value :  event;
       
        if(key.indexOf('.') > -1){
            let keyObj = key.split('.');
            this.configuration.SlideshowConfig[keyObj[0]][keyObj[1]] = value;
        }
        else {
            this.configuration.SlideshowConfig[key] = value;
        }
        
        //this.updateHostObject();
        this.updateHostObjectField(`SlideshowConfig.${key}`, value);
    }

    private updateHostObjectField(fieldKey: string, value: any) {
        
        this.hostEvents.emit({
            action: 'set-configuration-field',
            key: fieldKey,
            value: value
        });
    }

    async ngOnInit(): Promise<void> {
        
        const desktopTitle = await this.translate.get('SLIDESHOW.HEIGHTUNITS_REM').toPromise();

        if (!this.configuration) {
            this.loadDefaultConfiguration();
        }
        
        this.DropShadowStyle = [
            { key: 'Soft', value: this.translate.instant('SLIDE_EDITOR.SOFT') },
            { key: 'Regular', value: this.translate.instant('SLIDE_EDITOR.REGULAR') }
        ];

        this.transitionTypes = [
            { key: 'none', value: this.translate.instant('SLIDESHOW.TRANSITIONTYPES.NONE') },
            { key: 'fade', value: this.translate.instant('SLIDESHOW.TRANSITIONTYPES.FADE') },
            { key: 'slide', value: this.translate.instant('SLIDESHOW.TRANSITIONTYPES.SLIDE') },
            { key: 'blur', value: this.translate.instant('SLIDESHOW.TRANSITIONTYPES.BLUR') }
        ];
        
        this.buttonStyle = [
            { key: 'weak', value: this.translate.instant('SLIDE_EDITOR.BUTTON_STYLES.WEAK') },
            { key: 'weak-invert', value: this.translate.instant('SLIDE_EDITOR.BUTTON_STYLES.WEAK_INVERT') },
            { key: 'regular', value: this.translate.instant('SLIDE_EDITOR.BUTTON_STYLES.REGULAR') },
            { key: 'strong', value:this.translate.instant('SLIDE_EDITOR.BUTTON_STYLES.STRONG') }
        ];

        this.buttonColor = [
            { key: 'system', value:this.translate.instant('SLIDE_EDITOR.BUTTON_COLOR.SYSTEM') },
            { key: 'caution', value:this.translate.instant('SLIDE_EDITOR.BUTTON_COLOR.CAUTION') },
            { key: 'success', value:this.translate.instant('SLIDE_EDITOR.BUTTON_COLOR.CAUTION') },
        ];

        this.ArrowsType = [
            { key: 'arrow_back_right', iconName: 'arrow_back_right', callback: (event: any) => this.onSlideshowFieldChange('Arrows.Type',event) },
            { key: 'arrow_right', iconName: 'arrow_right', callback: (event: any) => this.onSlideshowFieldChange('Arrows.Type',event) },
            { key: 'arrow_right_alt', iconName: 'arrow_right_alt', callback: (event: any) => this.onSlideshowFieldChange('Arrows.Type',event) }
        ];
        
        this.controllersDisplayTypes = [
            { key: 'show', value: this.translate.instant('SLIDE_EDITOR.SHOW'), callback: (event: any) => this.onSlideshowFieldChange('Controllers.Display',event) },
            { key: 'hide', value: this.translate.instant('SLIDE_EDITOR.HIDE'), callback: (event: any) => this.onSlideshowFieldChange('Controllers.Display',event) }
        ]

        this.arrowsDisplayTypes = [
            { key: 'show', value: this.translate.instant('SLIDE_EDITOR.SHOW'), callback: (event: any) => this.onSlideshowFieldChange('Arrows.Display',event) },
            { key: 'hide', value: this.translate.instant('SLIDE_EDITOR.HIDE'), callback: (event: any) => this.onSlideshowFieldChange('Arrows.Display',event) }
        ]

        this.ArrowButtons = [
            // { key: 'none', value: this.translate.instant('GROUP_SIZE.NONE') },
            { key: 'regular', value: this.translate.instant('SLIDESHOW.ARROW_BUTTON.REGULAR'), callback: (event: any) => this.onSlideshowFieldChange('Arrows.Shape',event) },
            { key: 'round', value: this.translate.instant('SLIDESHOW.ARROW_BUTTON.ROUND'), callback: (event: any) => this.onSlideshowFieldChange('Arrows.Shape',event) }
        ];
    
        this.ControllerSize = [
            { key: 'sm', value: this.translate.instant('GROUP_SIZE.SM') },
            { key: 'md', value: this.translate.instant('GROUP_SIZE.MD') }
        ];
       
        // When finish load raise block-editor-loaded.
        //this.hostEvents.emit({action: 'block-editor-loaded'});
        this.blockLoaded = true;
    }

    addNewSlideClick() {
        let slide = new ISlideEditor();
        slide.id = (this.configuration.Slides.length);
        slide.Title.Content = this.getOrdinal(slide.id+1) + this.translate.instant('SLIDE_EDITOR.TITLE');
        this.configuration.Slides.push( slide); 
        this.updateHostObject();  
    }

    onSlideEditClick(event) {
       
        if(this.configuration.SlideshowConfig.EditSlideIndex === event.id){ //close the editor
            this.configuration.SlideshowConfig.EditSlideIndex = "-1";
        }
        else{ 
            this.currentSlideindex = this.configuration.SlideshowConfig.EditSlideIndex = event.id;
        }

        this.updateHostObject();
    }

    onSlideRemoveClick(event){
        this.configuration.Slides.splice(event.id, 1);
        this.configuration.Slides.forEach(function(slide, index, arr) {slide.id = index; });
        this.updateHostObject();
    }

    onSlideDuplicateClick(event){
        let slide = new ISlideEditor();
        slide = JSON.parse(JSON.stringify(this.configuration.Slides[event.id]));

        slide.id = (this.configuration?.Slides.length);
        this.configuration?.Slides.push(slide);
        this._configuration = this.configuration
        this.updateHostObject();  
    }

    onValueChange(event) {

    }

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
         moveItemInArray(this.configuration.Slides, event.previousIndex, event.currentIndex);
         for(let index = 0 ; index < this.configuration.Slides.length; index++){
            this.configuration.Slides[index].id = index;
         }
          this.updateHostObject();
        } 
    }

    onDragStart(event: CdkDragStart) {
        //this.galleryService.changeCursorOnDragStart();
    }

    onDragEnd(event: CdkDragEnd) {
        //this.galleryService.changeCursorOnDragEnd();
    }

    private getPageConfigurationParametersNames(): Array<string> {
        const parameters = new Set<string>();
        // Array of actions buttons
        const scriptBtns = ['FirstButton','SecondButton'];

        // Go for all slides scripts and add parameters to page configuration if Source is dynamic.
        for (let index = 0; index < this.configuration.Slides.length; index++) {
            const slide = this.configuration.Slides[index];
            scriptBtns.forEach(actButton => {
                if (slide[actButton]?.Flow?.runScriptData) {
                    Object.keys(slide[actButton]?.Flow.runScriptData?.ScriptData).forEach(paramKey => {
                        const param = slide[actButton]?.Flow.runScriptData.ScriptData[paramKey];
            
                        if (!parameters.has(param.Value) && param.Source === 'dynamic') {
                            parameters.add(param.Value);
                        }
                    });
                }
            });
        }

        // Return the parameters as array.
        return [...parameters];
    }

    /***************   FLOW AND CONSUMER PARAMETERS START   ********************************/
    onFlowChange(flowData: any) {
        const base64Flow = btoa(JSON.stringify(flowData));
        this.configuration.SlideshowConfig.OnLoadFlow = flowData?.FlowKey !== '' ? base64Flow : null;
        this.updateHostObject();
        this.updatePageConfigurationObject();
    }

    onSlideBtnFlowChanged(event: any) {
        this.updatePageConfigurationObject();
    }

    private initPageConfiguration(value: PageConfiguration = null) {
        this._pageConfiguration = value || JSON.parse(JSON.stringify(this.defaultPageConfiguration));
    }

    private updatePageConfigurationObject() {
        this.initPageConfiguration();

        // Get the consume parameters keys from the filters.
        const consumeParametersKeys = this.getConsumeParametersKeys();
        this.addParametersToPageConfiguration(consumeParametersKeys, false, true);
        
        // After adding the params to the page configuration need to recalculate the page parameters.
        this.flowService.recalculateEditorData(this._page, this._pageConfiguration);

        this.emitSetPageConfiguration();
    }

    private getConsumeParametersKeys(): Map<string, string> {
        const parametersKeys = new Map<string, string>();

        // Move on onload flows
        const onLoadFlow = this.configuration?.SlideshowConfig?.OnLoadFlow || null;
        if (onLoadFlow) {
            let flowParams = JSON.parse(atob(onLoadFlow)).FlowParams;
            Object.keys(flowParams).forEach(key => {
                const param = flowParams[key];
                if (param.Source === 'Dynamic') {
                    parametersKeys.set(param.Value, param.Value);
                }
            });
        }
        
        // Move on all the gallery cards flows.
        const scriptBtns = ['FirstButton','SecondButton'];
        for (let index = 0; index < this.configuration?.Slides?.length; index++) {
            const slide = this.configuration.Slides[index];
            // run on 1st & 2th buttons for eace slide
            scriptBtns.forEach(currBtn => {
                const flow = slide[currBtn]?.Flow || null;
                if(flow){
                    const flowParams = JSON.parse(atob(flow)).FlowParams || null;
                    if(flowParams){
                        Object.keys(flowParams).forEach(key => {
                            const param = flowParams[key];
                            if (param.Source === 'Dynamic') {
                                parametersKeys.set(param.Value, param.Value);
                            }
                        });
                    }
            }
            });
        }
        return parametersKeys;
    }

    private addParametersToPageConfiguration(paramsMap: Map<string, string>, isProduce: boolean, isConsume: boolean) {
        const params = Array.from(paramsMap.values());

        // Add the parameters to page configuration.
        for (let index = 0; index < params.length; index++) {
            const parameterKey = params[index];
            if(parameterKey !== 'configuration'){
                const paramIndex = this._pageConfiguration.Parameters.findIndex(param => param.Key === parameterKey);

                // If the parameter exist, update the consume/produce.
                if (paramIndex >= 0) {
                    this._pageConfiguration.Parameters[paramIndex].Consume = this._pageConfiguration.Parameters[paramIndex].Consume || isConsume;
                    this._pageConfiguration.Parameters[paramIndex].Produce = this._pageConfiguration.Parameters[paramIndex].Produce || isProduce;
                } else {
                    // Add the parameter only if not exist.
                    this._pageConfiguration.Parameters.push({
                        Key: parameterKey,
                        Type: 'String',
                        Consume: isConsume,
                        Produce: isProduce
                    });
                }
            }
        }
    }

    private emitSetPageConfiguration() {
        this.hostEvents.emit({
            action: 'set-page-configuration',
            pageConfiguration: this._pageConfiguration
        });
    }
    /***************   FLOW AND CONSUMER PARAMETERS END   ********************************/

}
