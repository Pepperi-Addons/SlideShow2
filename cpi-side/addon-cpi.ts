import '@pepperi-addons/cpi-node'
export const router:any = Router()
import SlidesowCpiService from './slideshow-cpi.service';
import path from 'path';

router.post('/on_slideshow_block_load', async (req, res) => {
    let configuration = req?.body?.Configuration;
    let configurationRes = configuration;
    const state = req.body.State;
    //check if flow configured to on load --> run flow (instaed of onload event)
    if(configuration?.SlideshowConfig?.OnLoadFlow){
        const cpiService = new SlidesowCpiService();
        //CALL TO FLOWS AND SET CONFIGURATION
        const res: any = await cpiService.getOptionsFromFlow(configuration.SlideshowConfig.OnLoadFlow, state, req.context, configuration );
        configurationRes = res?.configuration || configuration;
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

    //const mergeState = Object.assign(Object.assign({}, state), {configuration: configurationRes});

    res.json({
        Configuration: configurationRes,
    });
});

router.post('/run_slide_click_event', async (req, res) => {
    const state = req.body.State;
    const btnName = req.body.ButtonKey.btnName;
    let configuration = state?.configuration || req?.body?.Configuration;
    let configurationRes = configuration;
    const slideIndex = req.body.ButtonKey?.slideIndex;
    const btn = configuration?.Slides[slideIndex][btnName] || null;
    // check if button is enable and have flow
    if (btn?.Flow){
        const cpiService = new SlidesowCpiService();
        //CALL TO FLOWS AND SET CONFIGURATION
        const result: any = await cpiService.getOptionsFromFlow(btn.Flow || [], state , req.context, configuration);
        configurationRes = result?.configuration || configuration;
    }
    const mergeState = Object.assign(Object.assign({}, state), {configuration: configurationRes});
    res.json({
        State: mergeState,
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
            const res = await pepperi.addons.pfs.uuid("ad909780-0c23-401e-8e8e-f514cc4f6aa2").schema("Assets").key(assetKey).get();
            fileUrl = res.URL;
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

