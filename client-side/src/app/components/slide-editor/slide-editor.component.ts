import { Component, EventEmitter, Input, OnInit, AfterViewInit, Output, ViewChild, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ISlideShow, ISlideshowEditor, TransitionType, ArrowShape, ISlideEditor, textColor, IHostObject } from '../slideshow.model';
import { PepStyleType, PepSizeType, PepColorService} from '@pepperi-addons/ngx-lib';
import { PepButton } from '@pepperi-addons/ngx-lib/button';
import { PepColorSettings } from '@pepperi-addons/ngx-composite-lib/color-settings';
import { FlowService } from 'src/services/flow.service';
import { IPepMenuItemClickEvent, PepMenuItem } from '@pepperi-addons/ngx-lib/menu';
import { PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { PepQueryBuilderComponent } from '@pepperi-addons/ngx-lib/query-builder';
import { MatDialogRef } from '@angular/material/dialog';

interface groupButtonArray {
    key: string; 
    value: string;
}

@Component({
    selector: 'slide-editor',
    templateUrl: './slide-editor.component.html',
    styleUrls: ['./slide-editor.component.scss']
})
export class SlideEditorComponent implements OnInit, AfterViewInit {
    
    @ViewChild('showIfDialogTemplate') showIfDialogTemplate: TemplateRef<any>;
    
    @Input() configuration: ISlideShow;
    @Input() configurationSource: ISlideShow;
    @Input() pageParameters;
    @Input() id: string;
    @Input() isDraggable = false;
    @Input() selectedSlideIndex = -1;

    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    @Output() removeClick: EventEmitter<any> = new EventEmitter();
    @Output() editClick: EventEmitter<any> = new EventEmitter();
    @Output() duplicateClick: EventEmitter<any> = new EventEmitter();
    @Output() flowChange: EventEmitter<any> = new EventEmitter();
    
    TitleWeight: Array<PepButton> = [];
    WidthSize:  Array<PepButton> = [];
    
    textColors: Array<groupButtonArray> = [];
    buttonColor: Array<PepButton> = [];
    buttonStyle: Array<{key: PepStyleType, value: string}> = [];
    actionsMenu: Array<PepMenuItem> = [];
        
    public title: string;
    public flowHostObject;
    public flowHostObjectBtn2;

    protected showIfDialogRef: MatDialogRef<any> = null;
    
    constructor(
        private translate: TranslateService,
        private pepColorService: PepColorService,
        private flowService: FlowService,
        public dialogService: PepDialogService
    ) { 

    }

    async ngOnInit(): Promise<void> {
        this.title = this.configuration.Slides[this.id].Title.Content;

        const desktopTitle = await this.translate.get('SLIDESHOW.HEIGHTUNITS_REM').toPromise();

        this.TitleWeight = [
            { key: 'normal', value: this.translate.instant('SLIDE_EDITOR.FONT_WEIGHT.NORMAL'), callback: (event: any) => this.onSlideFieldChange('Title.Weight',event) },
            { key: 'bold', value: this.translate.instant('SLIDE_EDITOR.FONT_WEIGHT.BOLD'), callback: (event: any) => this.onSlideFieldChange('Title.Weight',event) }
        ]
    
        this.WidthSize =  [
            { key: 'Narrow', value: this.translate.instant('SLIDE_EDITOR.WIDTH_SIZE.NARROW'), callback: (event: any) => this.onSlideFieldChange('ContentWidth',event) },
            { key: 'Regular', value: this.translate.instant('SLIDE_EDITOR.WIDTH_SIZE.REGULAR'), callback: (event: any) => this.onSlideFieldChange('ContentWidth',event) },
            { key: 'Wide', value: this.translate.instant('SLIDE_EDITOR.WIDTH_SIZE.WIDE'), callback: (event: any) => this.onSlideFieldChange('ContentWidth',event) },
        ];
        
        this.textColors = [  
            { key: 'system', value: this.translate.instant('SLIDE_EDITOR.TEXT_COLOR.SYSTEM') },
            { key: 'dimmed', value: this.translate.instant('SLIDE_EDITOR.TEXT_COLOR.DIMMED') },
            { key: 'inverted', value: this.translate.instant('SLIDE_EDITOR.TEXT_COLOR.INVERTED') },
            { key: 'strong', value: this.translate.instant('SLIDE_EDITOR.TEXT_COLOR.STRONG') }
        ];

        this.buttonColor = [
            { key: 'system-primary', value:this.translate.instant('SLIDE_EDITOR.BUTTON_COLOR.SYSTEM') },
            { key: 'user-primary', value:this.translate.instant('SLIDE_EDITOR.BUTTON_COLOR.USER') },
        ]

        this.buttonStyle = [
            { key: 'weak', value: this.translate.instant('SLIDE_EDITOR.BUTTON_STYLES.WEAK')},
            { key: 'weak-invert', value: this.translate.instant('SLIDE_EDITOR.BUTTON_STYLES.WEAK_INVERT')},
            { key: 'regular', value: this.translate.instant('SLIDE_EDITOR.BUTTON_STYLES.REGULAR')},
            { key: 'strong', value:this.translate.instant('SLIDE_EDITOR.BUTTON_STYLES.STRONG')}
        ]; 
        
        this.actionsMenu = [
            { key: 'duplicate', text: this.translate.instant('SLIDESHOW.DUPLICATE') },
            { key: 'delete', text: this.translate.instant('SLIDESHOW.DELETE') }
        ]
        
     }

    ngAfterViewInit(): void {
        this.flowHostObject = this.flowService.prepareFlowHostObject((this.configuration?.Slides[this.id]['FirstButton'].Flow || null));
        //this.flowHostObjectBtn2 = this.flowService.prepareFlowHostObject((this.configuration?.Slides[this.id]['SecondButton'].Flow || null));
    }

    onEditClick(event) {
        this.editClick.emit({id: event ? this.id : -1});
    }

    onMenuItemClick(item: IPepMenuItemClickEvent){
        if(item?.source?.key == 'delete'){
            this.removeClick.emit({id: this.id});
        }
        else if(item?.source?.key == 'duplicate'){
            this.duplicateClick.emit({id: this.id});
        }
    }

    onSlideFieldChange(key, event){
        const value = event && event.source && event.source.key ? event.source.key : event && event.source && event.source.value ? event.source.value :  event;
        if(key.indexOf('.') > -1){
            let keyObj = key.split('.');
            this.configuration.Slides[this.id][keyObj[0]][keyObj[1]] = value;
        }
        else{
            this.configuration.Slides[this.id][key] = value;
        }

        this.updateHostObjectField(`Slides[${this.id}].${key}`, value);
    }

    private updateHostObjectField(fieldKey: string, value: any, updatePageConfiguration = false) {
        
        this.hostEvents.emit({
            action: 'set-configuration-field',
            key: fieldKey,
            value: value,
            updatePageConfiguration: updatePageConfiguration
        });
    }

    getSliderBackground( color){
        let alignTo = 'right';

        let col: PepColorSettings = new PepColorSettings();

        col.value = color;
        col.opacity = 100;

        let gradStr =  this.getRGBAcolor(col,0) +' , '+ this.getRGBAcolor(col); 
        
        return 'linear-gradient(to ' + alignTo +', ' +  gradStr +')';
    }

    getRGBAcolor(colObj: PepColorSettings, opac = null){
        let rgba = 'rgba(255,255,255,0';
            if(colObj){
                let color = colObj.value;
                let opacity = opac != null ? opac : colObj.opacity;

                opacity = opacity > 0 ? opacity / 100 : 0;
                //check if allready rgba
                
                let hsl = this.pepColorService.hslString2hsl(color);
                let rgb = this.pepColorService.hsl2rgb(hsl);
                
                rgba = 'rgba('+ rgb.r + ','  + rgb.g + ',' + rgb.b + ',' + opacity + ')';
        }
        return rgba;
    }

    onHostEvents(event: any) {
        if(event?.url){
            this.configuration.Slides[this.id]['Image'].AssetKey = event.key;
            this.configuration.Slides[this.id]['Image'].AssetUrl = event.url;

            this.updateHostObjectField(`Slides[${this.id}].Image.AssetUrl`, event.url);
            this.updateHostObjectField(`Slides[${this.id}].Image.AssetKey`, event.key);
        }     
    }

    onFlowChange(flowData: any, btnName: string) {
        const base64Flow = btoa(JSON.stringify(flowData));
        this.configuration.Slides[this.id][btnName].Flow =  base64Flow;
        this.updateHostObjectField(`Slides[${this.id}][${btnName}].Flow`, base64Flow, true);
        this.flowChange.emit();
    }

    buildShowIfQuery(){
        const fields = [];
        for (const [key, value] of Object.entries(this.pageParameters)) {
            fields.push({FieldID: key, Title: key, FieldType: 'String' });
          }
          return fields;
    }

    openFilterBuilderModal(event: any){
        
        const query = JSON.parse(this.configuration?.Slides[this.id]?.Filter?.FilterObj || null);
        
        //     { FieldID: 'TSAAttachmentTest1', Title: 'TSA Attachment Test11', FieldType: 'String'},
        //     { FieldID: 'AvnerTest', Title: 'Avner Test', FieldType: 'MultipleStringValues' , OptionalValues: [
        //         { Key: 'value0', Value: 'value d' },
        //         { Key: 'value1', Value: 'value e' },
        //         { Key: 'value2', Value: 'value 2' }
        //     ]},
        //     { FieldID: 'AllowDecimal', Title: 'Allow Decimal', FieldType: 'Bool' },
        //     { FieldID: 'Double Check', Title: 'Double', FieldType: 'Double' },
        //     { FieldID: 'CostPrice', Title: 'Cost Price', FieldType: 'Integer' },
        //     { FieldID: 'CaseQuantity', Title: 'Case Quantity', FieldType: 'Integer' },
        //     { FieldID: 'CampaignName', Title: 'Campaign Name', FieldType: 'String' },
        //     { FieldID: 'ActionDateTime', Title: 'Action Date Time', FieldType: 'DateTime' },
        //     { FieldID: 'Type', Title: 'Type', FieldType: 'String' },
        //     { FieldID: 'TSAboolll', Title: 'TSA boolll', FieldType: 'Bool' },

        //     {
        //         FieldID: 'BillToState', Title: 'Bill To State', FieldType: 'MultipleStringValues', OptionalValues: [
        //             { Key: 'value0', Value: 'value 0' },
        //             { Key: 'value1', Value: 'value 1' },
        //             { Key: 'value2', Value: 'value 2' },
        //             { Key: 'value3', Value: 'value 3' },
        //             { Key: 'value4', Value: 'value 4' },
        //             { Key: 'value5', Value: 'value 5' },
        //             { Key: 'value6', Value: 'value 6' },
        //             { Key: 'value7', Value: 'value 7' },
        //             { Key: 'value8', Value: 'value 8' },
        //             { Key: 'value9', Value: 'value 9' },
        //         ]
        //     }
        // ];
        const data = {
            query: query,
            fields: this.buildShowIfQuery(), //this.getShowIfFields(),
            isValid: true,
            outputData: { query: '' }
        };

        const config = this.dialogService.getDialogConfig({ minWidth: '30rem'}, 'large');

        this.showIfDialogRef = this.dialogService.openDialog(this.showIfDialogTemplate, data, config);        
        this.showIfDialogRef.afterClosed().subscribe({
            next: (res) => {
                if (res?.query != null) {
                    const filterQuery = JSON.stringify(res.query);
                    this.configuration.Slides[this.id].Filter.FilterObj = filterQuery;
                    this.updateHostObjectField(`Slides[${this.id}].Filter.FilterObj`, filterQuery);
                }
            }     
        })
        
    }
}
