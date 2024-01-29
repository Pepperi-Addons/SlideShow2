import { PepStyleType, PepSizeType, PepHorizontalAlignment} from '@pepperi-addons/ngx-lib';
import { PepShadowSettings} from "@pepperi-addons/ngx-composite-lib/shadow-settings";
import { PepColorSettings } from "@pepperi-addons/ngx-composite-lib/color-settings";
import { Page } from '@pepperi-addons/papi-sdk';
import { v4 as uuid } from 'uuid';

export type HeightUnit = 'REM' | 'VH';
export type TransitionType = 'none' | 'fade' | 'blur' | 'slide';
export type ArrowType = 'arrow_back_right' | 'arrow_right' | 'arrow_right_alt';
export type ArrowShape = 'none' | 'regular' | 'round';
export type WidthUnits = 'Narrow' | 'Regular' | 'Wide';
export type Intensity = 'Soft' | 'Regular';
export type textColor = 'system' | 'dimmed' | 'inverted' | 'strong';
export type FontWeight = 'normal' | 'bold' | 'bolder';
export type buttonColor = 'system-primary' | 'invert' | 'user-primary' | 'success' | 'caution' | 'system' ;
export type DisplayStates = 'show' | 'hide'; 

export class SlideButton {
    Use: boolean;
    Label: string = 'Button';
    Flow: any;
    ButtonKey: string = uuid();
    Style: PepStyleType;
    Visible: string;


    constructor(use = true, label = 'Yess', style: PepStyleType = 'weak-invert', visible = 'true') {
        this.Use = use;
        this.Label = label;
        this.Style = style;
        this.Visible = visible;
      }
}

export class Filter {
    Use: boolean;
    FilterObj: string;
    ShowSlide: boolean;

    constructor(use = false, filter = '', showslide = true){
        this.Use = use;
        this.FilterObj = filter;
        this.ShowSlide = showslide;
    }
}
export class SlideImage {
    Use: boolean = false;
    AssetKey: string = '';
    AssetUrl: string = '';
    HorizontalPosition: string = '50';
    VerticalPosition: string = '50';
}

export class Structure {
    Unit: HeightUnit;
    FillHeight: boolean;
    Height: string;
    InnerPadding: PepSizeType = "md";

    constructor(unit: HeightUnit = "REM", fillHeight: boolean = false, height: string = '16', innerPadding: PepSizeType = 'md' ){
        this.Unit = unit;
        this.FillHeight = fillHeight;
        this.Height = height;
        this.InnerPadding = innerPadding;
    }
}

export class Corners {
    Use: boolean = false;
    Size: PepSizeType = 'md';
}

export class Transition {
    Use: boolean = true;
    Duration: string = '5';
    Type: TransitionType = 'fade';
    Time: string = '0.75';
}

export class Arrows {
    Use: boolean = true;
    Type: ArrowType = 'arrow_right';
    Shape: ArrowShape = 'round';
    Style: PepStyleType= 'weak';
    Display: DisplayStates = 'show';
    Color: buttonColor= 'system';
}

export class Controllers {
    ShowInSlider: boolean = true;
    Display: DisplayStates = 'show';
    Size: PepSizeType = 'sm';
    Style: PepStyleType= 'weak-invert';
    ShowPause: boolean = true;
}

//export interface ISlideshowEditor {
export class ISlideshowEditor {
    OnLoadFlow: any;
    Structure: Structure = new Structure('REM', false, '16', 'md');
    Transition: Transition = new Transition();
    Arrows: Arrows = new Arrows();
    Controllers: Controllers = new Controllers();
    DropShadow: PepShadowSettings = new PepShadowSettings(false,'md','soft');
    Corners: Corners = new Corners();
}

export class Title {
    Use: boolean;
    Content: string;
    Size: PepSizeType;
    Weight: FontWeight;
    MaxRowsNum: number;

    constructor(use = true, content = 'Title', size:PepSizeType  = 'md', weight:FontWeight = 'normal', maxrowsnum = 2){
        this.Use = use;
        this.Content = content;
        this.Size = size;
        this.Weight = weight;
        this.MaxRowsNum = maxrowsnum;

    }
}

export class Button {
    Size: PepSizeType  = 'md';
    Color: buttonColor= 'system-primary';
}

export class Alignment {
    Horizontal: PepHorizontalAlignment = 'left';
    Vertical: 'start' | 'middle' | 'end' = 'start';
}

export class ISlideEditor {
    id: number;
    Title = new Title();
    SubTitle = new Title(true, 'Sub title', 'md', 'normal');
    Filter = new Filter(false, null, true);
    FirstButton: SlideButton = new SlideButton(true, 'Yess', 'weak-invert');
    SecondButton: SlideButton  = new SlideButton(false, 'Noo', 'strong');
    TextColor: textColor = 'inverted';
    Button = new Button();
    Alignment = new Alignment();
    ContentWidth: WidthUnits = 'Wide';
    InnerSpacing: PepSizeType | "none" = "none";
    GradientOverlay: PepColorSettings = new PepColorSettings(true, 'hsl(0, 100%, 50%)', 75);
    Overlay: PepColorSettings = new PepColorSettings(true, 'hsl(0, 0%, 0%)', 75);
    Image: SlideImage = new SlideImage();
    SlideInteractivity: string = 'false';
}



export interface ISlideShow{
    SlideshowConfig: ISlideshowEditor,
    Slides: Array<ISlideEditor>
}

export interface IHostObject {
    state: any;
    configuration: ISlideShow;
    configurationSource: ISlideShow;
    pageConfiguration: any;
    page: Page,
    parameters: any;
}
 