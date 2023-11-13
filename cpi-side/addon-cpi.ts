import '@pepperi-addons/cpi-node'
export const router:any = Router()
import SlidesowCpiService from './slideshow-cpi.service';
import * as _ from 'lodash'

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
    const difference = _.differenceWith(_.toPairs(configurationRes), _.toPairs(configuration), _.isEqual);
    difference.forEach(diff => {
        state[diff[0]] = diff[1];
    });

    res.json({
        State: state,
        Configuration: configurationRes,
    });
});

router.post('/run_slide_click_event', async (req, res) => {
    const state = req.body.State;

    const btnKey = req.body.ButtonKey;
    let configuration = req?.body?.Configuration;

    for (var prop in configuration) {
        // skip loop if the property dont exits on state object
        if (!state.hasOwnProperty(prop)) continue;
        //update configuration with the object from state
        configuration[prop] = state[prop]; 
    }

    let configurationRes = configuration;
    let btn;
    for(let i=0; i< configuration.Slides.length; i++){
            const slide = configuration.Slides[i];
            if(slide['FirstButton'].ButtonKey === btnKey){
                btn = slide['FirstButton']; 
                break;  
             }
             else if(slide['SecondButton'].ButtonKey === btnKey){
                 btn = slide['SecondButton'];
                 break;
             } 
    }
    // check if button is enable and have flow
    if (btn?.Flow){
        const cpiService = new SlidesowCpiService();
        //CALL TO FLOWS AND SET CONFIGURATION
        const result: any = await cpiService.getOptionsFromFlow(btn.Flow || [], state , req.context, configuration);
        configurationRes = result?.configuration || configuration;
    }
    
    const difference = _.differenceWith(_.toPairs(configurationRes), _.toPairs(configuration), _.isEqual);
    difference.forEach(diff => {
        state[diff[0]] = diff[1];
    });

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

