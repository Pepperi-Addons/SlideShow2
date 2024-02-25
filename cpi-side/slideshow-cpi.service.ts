import { Client, Context, IClient, IContext } from '@pepperi-addons/cpi-node/build/cpi-side/events';
import { AddonUUID } from '../addon.config.json';
import { FlowObject, RunFlowBody } from '@pepperi-addons/cpi-node';
import { filter } from '@pepperi-addons/pepperi-filters';
class SlidesowCpiService {
    
    constructor() {}

    /***********************************************************************************************/
    //                              Private functions
    /************************************************************************************************/

    private convertShowIfQueryValuesToString(query: any) {
        if (query) {
            // If the query has values.
            if (query.Values) {
                // If the values is more then one, convert them to array of one string item with ';' delimiter for the comparation.
                if (query.Values.length > 1 && query.Operation === "IsEqual") {
                    query.Values = [query.Values.join(';')];
                }
            } else {
                // Convert the left and right nodes if exist.
                if (query.LeftNode) {
                    this.convertShowIfQueryValuesToString(query.LeftNode);
                } 
                if (query.RightNode) {
                    this.convertShowIfQueryValuesToString(query.RightNode);
                }
            }
        }

        return query
    }

    /***********************************************************************************************/
    //                              Public functions
    /************************************************************************************************/
    
    public calcShowIf(slides: any, pageParameters): void {
        slides.forEach(slide => {
            let shouldBeVisible = true;

            if (slide?.Filter?.Use && slide.Filter.FilterObj != '') {
                const query = this.convertShowIfQueryValuesToString(JSON.parse(slide.Filter.FilterObj));
                // Call pepperi filters to apply this.
                shouldBeVisible = filter([pageParameters], query).length > 0;
            }
            slide.Filter['ShowSlide'] = shouldBeVisible;  
        }); 
        return slides;
    }

    public async getOptionsFromFlow(flowStr: string, state: any, context: IContext | undefined, configuration = {}): Promise<any> {
        const flowData: FlowObject = flowStr?.length ? JSON.parse(Buffer.from(flowStr, 'base64').toString('utf8')) : {};
        
        if (flowData?.FlowKey?.length > 0) {
            const dynamicParamsData: any = {};
            if (flowData.FlowParams) {
                const dynamicParams: any = [];
                

                // Get all dynamic parameters to set their value on the data property later.
                const keysArr = Object.keys(flowData.FlowParams);
                for (let index = 0; index < keysArr.length; index++) {
                    const key = keysArr[index];
                    
                    if (flowData.FlowParams[key].Source === 'Dynamic') {
                        dynamicParams.push(flowData.FlowParams[key].Value);
                    }
                }
                
                // Set the dynamic parameters values on the dynamicParamsData property.
                for (let index = 0; index < dynamicParams.length; index++) {
                    const param = dynamicParams[index];
                    dynamicParamsData[param] = param === 'configuration' ? configuration : state[param] || '';
                }
            }

            const flowToRun: RunFlowBody = {
                RunFlow: flowData,
                Data: dynamicParamsData,
                context: context
            };

            // Run the flow and return the options.
            const flowRes = await pepperi.flows.run(flowToRun);
            return flowRes;
        }
        else{
            return {};
        }

        
    }

    async setUserTranslations(configuration: any): Promise<void> {
        if (configuration?.Slides?.length > 0) {
            for (let index = 0; index < configuration.Slides.length; index++) {
                const item = configuration.Slides[index];

                if (item.Title?.Use) {
                    item.Title.Content = await pepperi.translations.translate({ key: item.Title.Content });
                }

                if (item.SubTitle?.Use) {
                    item.SubTitle.Content = await pepperi.translations.translate({ key: item.SubTitle.Content });
                }

                if (item.FirstButton?.Use) {
                    item.FirstButton.Label = await pepperi.translations.translate({ key: item.FirstButton.Label });
                }

                if (item.SecondButton?.Use) {
                    item.SecondButton.Label = await pepperi.translations.translate({ key: item.SecondButton.Label });
                }
            }
        }
    }
}
export default SlidesowCpiService;