import { PapiClient, InstalledAddon } from '@pepperi-addons/papi-sdk'
import { Client } from '@pepperi-addons/debug-server';

class MyService {
    papiClient: PapiClient

    constructor(private client: Client) {
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            addonUUID: client.AddonUUID,
            addonSecretKey: client.AddonSecretKey,
            actionUUID: client.AddonUUID
        });
    }

    // getRelations(relationName: string): Promise<any> {
    //     return this.papiClient.get(`/addons/data/relations?where=RelationName=${relationName}`);
    // }

    upsertRelation(relation): Promise<any> {
        return this.papiClient.post('/addons/data/relations', relation);
    }

    async importDataSource(body,distUUID) {
        console.log(`!!**!!** Slideshow import body: ${JSON.stringify(body)}`);
        console.log(`!!**!!** Slideshow import  body.Object.Slides: ${JSON.stringify(body['Object'].Slides)}`);
       body['Object'].Slides = await Promise.all(body['Object'].Slides.map(async (slide) => {

        console.log(`!!**!!** Slideshow import** slide: ${JSON.stringify(slide)}`);
        console.log(`!!**!!** Slideshow import** distUUID: ${distUUID}`);

        //check if distributor uuid included on assets pfs url
        //if not - replace it with empty string;
        if(slide?.Image?.AssetUrl.indexOf(distUUID) == -1){
            slide.Image.Use = false;
            slide.Image.AssetKey = '';
            slide.Image.AssetUrl = '';
        }
       
        return slide;
    }));
    
    console.log('!!**!!** Slideshow import returned body:', JSON.stringify(body));
    return body['Object'];
    }
  

    async exportDataSource(body: any): Promise<any> {
        const res = await this.getDIMXResult(body, false);
        return res;
    }

    private async getDIMXResult(body: any, isImport: boolean): Promise<any> {
        // Validate the pages.
        if (body.DIMXObjects?.length > 0) {
            console.log('@@@@@@@@ getDIMXResult - enter ', JSON.stringify(body));
            console.log('@@@@@@@@ getDIMXResult - isImport = ', isImport);

            for (let index = 0; index < body.DIMXObjects.length; index++) {
                const dimxObject = body.DIMXObjects[index];
                try {
                    //const page = await this.validateAndOverridePageAccordingInterface(dimxObject['Object'], isImport);
                    
                    // For import always generate new Key and set the Hidden to false.
                    if (isImport) {
                        //page.Key = uuidv4(); // This step happans in the importMappingPages function
                        //page.Hidden = false;
                    }
                    //dimxObject['Object'] = page;
                } catch (err) {
                    // Set the error on the page.
                    dimxObject['Status'] = 'Error';
                    dimxObject['Details'] = err;
                }
            }

            console.log('@@@@@@@@ getDIMXResult - exit ', JSON.stringify(body));
        }
        
        return body;
    }
}

export default MyService;