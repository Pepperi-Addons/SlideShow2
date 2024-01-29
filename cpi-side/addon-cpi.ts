import '@pepperi-addons/cpi-node'
export const router:any = Router()
import SlidesowCpiService from './slideshow-cpi.service';
import * as _ from 'lodash'

router.post('/on_slideshow_block_load', async (req, res) => {
    const cpiService = new SlidesowCpiService();
    //const pageParameters = req?.context?.State?.PageParameters || null;
    const state = req.context.State.PageParameters; //req.body.State ||
    let configuration = req?.body?.Configuration;

    //check if should show the slide according to the 'Show If' query & page parameters
    if(configuration.Slides && state){
        configuration.Slide = await cpiService.calcShowIf(configuration.Slides, state);
    }
    
    let configurationRes = configuration;

    //check if flow configured to on load --> run flow (instaed of onload event)
    if(configuration?.SlideshowConfig?.OnLoadFlow){
        try{  
            //CALL TO FLOWS AND SET CONFIGURATION
            const res: any = await cpiService.getOptionsFromFlow(configuration.SlideshowConfig.OnLoadFlow, state, req.context, configuration );
            configurationRes = res?.configuration || configuration;
        }
        catch(err){
            configurationRes = configuration;
        }
    }

    if(!(await pepperi['environment'].isWebApp())) {
        let Slides = configurationRes?.Slides || [] as any[];
        if(Slides.length){
            await Promise.all(Slides.map(async (slide) => {
                // overwrite the slides assetURL with the local file path
                return slide.Image.AssetUrl = await getFilePath(slide.Image)
            }))
            configurationRes.Slides = Slides;
         }
    }
    res.json({
        State: state,
        Configuration: configurationRes,
    });
});

router.post('/run_slide_click_event', async (req, res) => {
    const state = req.body.State;
    const cpiService = new SlidesowCpiService();
    const btnKey = req.body.ButtonKey;
    let configuration = req?.body?.Configuration;

    //check if should show the slide according to the 'Show If' query & page parameters
    if(configuration?.Slides && state){
        configuration.Slide = await cpiService.calcShowIf(configuration.Slides, state);
    }

    let btn;
    for(let i=0; i< configuration.Slides.length; i++){
            const slide = configuration.Slides[i];
            if(slide['FirstButton'].ButtonKey === btnKey){
                btn = slide['FirstButton']; 
                break;  
             }
    }
    let configurationRes = null;
    // check if button is enable and have flow
    if (btn?.Flow){
        //CALL TO FLOWS AND SET CONFIGURATION
        const result: any = await cpiService.getOptionsFromFlow(btn.Flow || [], state , req.context, configuration);
        configurationRes = result?.configuration;
    }

    res.json({
        State: state,
        Configuration: configurationRes,
    });
});

router.post('/on_block_state_change', async (req, res) => {
    const state = req.body.State || {};
    const changes = req.body.Changes || {};
    //const configuration = req.body.Configuration;

    const mergeState = {...state, ...changes};
    res.json({
        State: mergeState,
        Configuration: changes,
    });
});



async function getFilePath(image) {
    let fileUrl;
    const assetKey = image.AssetKey;
   
    try {
            if(assetKey && assetKey != ''){
                const res = await pepperi.addons.pfs.uuid("ad909780-0c23-401e-8e8e-f514cc4f6aa2").schema("Assets").key(assetKey).get();
                fileUrl = res.URL;
            }
            else{
                fileUrl = '';
            }
        }
        catch (error) {
           fileUrl = fixURLIfNeeded(image.AssetUrl);        
        }
    return fileUrl;
}

function fixURLIfNeeded(url) {
    // remove the ' from the start and the end of the string only if they exist
    if (url.startsWith("'") && url.endsWith("'")) {
        url = url.substring(1, url.length - 1);
    }
    return url;
}

export async function load(configuration: any) {
    
}

