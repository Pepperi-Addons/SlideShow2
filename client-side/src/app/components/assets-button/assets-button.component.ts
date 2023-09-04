import { TranslateService } from '@ngx-translate/core';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef } from "@angular/core";
import { MatDialogRef } from '@angular/material/dialog';
import { PepAddonBlockLoaderService } from '@pepperi-addons/ngx-lib/remote-loader';

@Component({
    selector: 'assets-button',
    templateUrl: './assets-button.component.html',
    styleUrls: ['./assets-button.component.scss']
})

export class AssetsButtonComponent implements OnInit {
   
    @ViewChild('assetsBtnCont', { static: false }) assetsBtnCont: ElementRef;
    // @ViewChild('addonLoaderContainer', { read: ViewContainerRef }) addonLoaderContainer: ViewContainerRef;
    
    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    
    @Input() imageURL: string = '';
    @Input() disabled: boolean = false;

    dialogRef: MatDialogRef<any>;

    assetsHostObject = {
        selectionType: 'single',
        allowedAssetsTypes: 'images',
        inDialog: true
    }

    constructor(
        private viewContainerRef: ViewContainerRef,
        public translate: TranslateService,
        private addonBlockLoaderService: PepAddonBlockLoaderService) {

    }

    ngOnChanges(changes) { 
        if (changes) {
        }
    }

    ngOnInit() {

    }

    onOpenAssetsDialog() {
        if(!this.disabled){
            this.dialogRef = this.addonBlockLoaderService.loadAddonBlockInDialog({
                container: this.viewContainerRef,
                name: 'AssetPicker',
                hostObject: this.assetsHostObject,
                hostEventsCallback: (event) => { this.onHostEvents(event); }
            });
        }
    }

    onHostEvents(event: any) {
        this.hostEvents.emit(event);

        if (this.dialogRef) {
            this.dialogRef.close(null);
        }
    }
}
