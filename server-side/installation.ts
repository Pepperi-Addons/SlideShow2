
/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The error Message is importent! it will be written in the audit log and help the user to understand what happen
*/
const SLIDESHOW_TABLE_NAME = '';

import { Client, Request } from '@pepperi-addons/debug-server'
import { Relation } from '@pepperi-addons/papi-sdk';
import MyService from './my.service';
import { blockName, DimxRelations, SlideshowScheme } from './metadata';
import { servicesVersion } from 'typescript';
 
 

export async function install(client: Client, request: Request): Promise<any> {

    const slideshowRelationsRes = await runMigration(client);
    const dimxRes = await createDimxRelations(client);
    const dimxSchemeRes = await addDimxScheme(client);
    // const deleteOldSlideRelation = await deleteOldSlideshowRelation(client);
   
    return {
        success: slideshowRelationsRes.success && dimxRes.success && dimxSchemeRes.success,
        errorMessage: `slideshowRelationsRes: ${slideshowRelationsRes.errorMessage}, 
                      userDeviceResourceRes: ${dimxRes.errorMessage}, 
                      userDeviceResourceRes: ${dimxSchemeRes.errorMessage}`
    };
}

export async function uninstall(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}

export async function upgrade(client: Client, request: Request): Promise<any> {
    const slideshowRelationsRes = await runMigration(client);
    const dimxRes = await createDimxRelations(client);
    const dimxSchemeRes = await addDimxScheme(client);
    // const deleteOldSlideRelation = await deleteOldSlideshowRelation(client);
    return {
        success: slideshowRelationsRes.success && dimxRes.success && dimxSchemeRes.success,
        errorMessage: `slideshowRelationsRes: ${slideshowRelationsRes.errorMessage}, 
                       userDeviceResourceRes: ${dimxRes.errorMessage}, 
                       userDeviceResourceRes: ${dimxSchemeRes.errorMessage}`
    };
}

export async function downgrade(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}

async function runMigration(client){
    try {
        const pageComponentRelation: Relation = {
            RelationName: "PageBlock",
            Name: blockName,
            Description: `${blockName} block`,
            Type: "NgComponent",
            SubType: "NG14",
            AddonUUID: client.AddonUUID,
            AddonRelativeURL: `file_${client.AddonUUID}`,
            ComponentName: `${blockName}Component`,
            ModuleName: `${blockName}Module`,
            EditorComponentName: `${blockName}EditorComponent`,
            EditorModuleName: `${blockName}EditorModule`,
            ElementsModule: 'WebComponents',
            ElementName: `slideshow-element-${client.AddonUUID}`,
            EditorElementName: `slideshow-editor-element-${client.AddonUUID}`,
            Schema: {
                "Fields": {
                    "SlideshowConfig": {    
                            "Type": "Object",
                            "Fields": {
                                "Structure": {
                                        "Type": "Object",
                                        "Fields": {
                                        "Unit": {
                                            "Type": "String",
                                            "ConfigurationPerScreenSize": true
                                        },
                                        "Height": {
                                            "Type": "String",
                                            "ConfigurationPerScreenSize": true
                                        },
                                        "InnerPadding": {
                                            "Type": "String",
                                            "ConfigurationPerScreenSize": true
                                        }
                                    }
                                },
                                "Controllers": {
                                    "Type": "Object",
                                        "Fields": {
                                            "Size": {
                                                "Type": "String",
                                                "ConfigurationPerScreenSize": true
                                            },
                                            "Display":{
                                                "Type": "String",
                                                "ConfigurationPerScreenSize": true
                                            }
                                        }
                                },
                                "Arrows": {
                                    "Type": "Object",
                                    "Fields": {
                                        "Display":{
                                            "Type": "String",
                                            "ConfigurationPerScreenSize": true
                                        }
                                    }
                                },
                            }
                    },
                    "Slides": {
                        "Type": "Array",
                        "Items": {
                            "Type": "Object",
                            "Fields": {
                                "Title": {
                                    "Type": "Object",
                                    "Fields": {
                                        "Size": {
                                            "Type": "String",
                                            "ConfigurationPerScreenSize": true
                                        }
                                    }
                                },
                                "SubTitle": {
                                    "Type": "Object",
                                    "Fields": {
                                        "Size": {
                                            "Type": "String",
                                            "ConfigurationPerScreenSize": true
                                        }
                                    }
                                },
                                "ContentWidth": {
                                    "Type": "String",
                                    "ConfigurationPerScreenSize": true
                                },
                                "Alignment":{
                                    "Type": "Object",
                                    "Fields": {
                                        "Horizontal": {
                                            "Type": "String",
                                            "ConfigurationPerScreenSize": true
                                        },
                                        "Vertical": {
                                            "Type": "String",
                                            "ConfigurationPerScreenSize": true
                                        }
                                    }
                                },
                                "Button":{
                                    "Type": "Object",
                                    "Fields": {
                                        "Size": {
                                            "Type": "String",
                                            "ConfigurationPerScreenSize": true
                                        }
                                    }
                                },
                                "FirstButton":{
                                    "Type": "Object",
                                    "Fields": {
                                        "Visible": {
                                            "Type": "String",
                                            "ConfigurationPerScreenSize": true
                                        }
                                    }
                                },
                                "SlideInteractivity": {
                                    "Type": "String",
                                    "ConfigurationPerScreenSize": true
                                },
                                "Image": {
                                    "Type": "Object",
                                    "Fields": {
                                        "Use": {
                                            "Type": "Bool",
                                            "ConfigurationPerScreenSize": false, 
                                        },
                                        "AssetKey": {
                                            "Type": "Resource",
                                            "Fields": {
                                                "url": {
                                                    "Type": "String"
                                                },
                                                "key": {
                                                    "Type": "String"
                                                }
                                            },
                                            "ConfigurationPerScreenSize": false, 
                                        },
                                        "HorizontalPosition": {
                                            "Type": "String",
                                            "ConfigurationPerScreenSize": true, 
                                        },
                                        "VerticalPosition": {
                                            "Type": "String",
                                            "ConfigurationPerScreenSize": true, 
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
             },
             BlockLoadEndpoint: "/addon-cpi/on_slideshow_block_load",
             BlockButtonClickEndpoint: "/addon-cpi/run_slide_click_event",
             BlockStateChangeEndpoint: "/addon-cpi/on_block_state_change",
             Title: 'Slideshow'
        }; 
        
        const service = new MyService(client);
        const result = await service.upsertRelation(pageComponentRelation);
        return {success:true, errorMessage: '' };
    } catch(e) {
        return { success: false, errorMessage: e || '' };
    }
}

async function deleteOldSlideshowRelation(client: Client){
    try {
        const service = new MyService(client);
        const res = await service.papiClient.addons.api.uuid('f93658be-17b6-4c92-9df3-4e6c7151e038').file('api').func('delete_relation').post();
        return {
            success:res.success,
            errorMessage: res.erroeMessage
        }
    }
    catch(e) {
        return { success: false, errorMessage: e || 'Slideshow - delete relation failed' };
    }
}

async function createDimxRelations(client) {
    
    let relations: Relation[] = DimxRelations;
    let relationName = '';

    try {
        const service = new MyService(client);

        relations.forEach(async (relation) => {
            relationName = relation.RelationName;
            const result = await service.upsertRelation(relation);
        });
        return {
            success: true,
            errorMessage: ''
        }
    }
    catch (err) {
        return {
            success: false,
            errorMessage: relationName + ' ' + (err ? err : 'Unknown Error Occured'),
        }
    }
}

async function addDimxScheme(client) {
    try {
        const service = new MyService(client);
        service.papiClient.addons.data.schemes.post(SlideshowScheme);
        return {
            success: true,
            errorMessage: ''
        }
    }
    catch (err) {
            return {
                success: false,
                errorMessage: `Error in creating slideshow scheme for dimx . error - ${err}`
            }
    }
}


