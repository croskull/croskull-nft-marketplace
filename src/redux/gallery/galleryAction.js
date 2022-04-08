import { ethers } from "ethers";
import store from "../store";





const updateState = (payload) => {
    return {
        type: "UPDATE_STATE",
        payload: payload
    }
}

export const loadAllSkull = (page) => {
    return async (dispatch) => {
        let { gallery } = store.getState()
        const rawResult = await fetch( 'https://croskull.mypinata.cloud/ipfs/QmSrjCsmQ9e5m1HFYXRSYgxHi9K6u9a6DXRsWz7KWW5i6p/_metadata' );
        let rawList = await rawResult.json();
        let {skullsList} = gallery;
        if(!skullsList)
        skullsList = []
        for(let i=page*100; i<page*100+100; i++)
        {
            skullsList.push(rawList[i]);
        }
        dispatch(updateState({
            key: "skullsList",
            value: skullsList,
        }))
    }
}

export const loadFilterSkull = (filter,page) => {
    return async (dispatch) => {
        let { gallery } = store.getState()
        let {skullsList} = gallery;
        const rawResult = await fetch( 'https://croskull.mypinata.cloud/ipfs/QmSrjCsmQ9e5m1HFYXRSYgxHi9K6u9a6DXRsWz7KWW5i6p/_metadata' );
        let rawList = await rawResult.json();
        let i=0;
        let start=page*100;
        let end = page*100+100
        if(!skullsList)
            skullsList = []
        rawList.map( skull =>{
            
                if(checkFilter(skull,filter))
                {
                    if(i>=start && i<end)
                {
                    skullsList.push(skull);
                 }
                    i++;
                }
            })
            
        if(skullsList.length ==0)
            skullsList = null;
        dispatch(updateState({
            key: "skullsList",
            value: skullsList,
        }))
    }
}
export const getFilterSkullLenght = (filter) => {
    return async (dispatch) => {
        let { gallery } = store.getState()
        const rawResult = await fetch( 'https://croskull.mypinata.cloud/ipfs/QmSrjCsmQ9e5m1HFYXRSYgxHi9K6u9a6DXRsWz7KWW5i6p/_metadata' );
        let rawList = await rawResult.json();
        let i=0;
        rawList.map( skull =>{

                if(checkFilter(skull,filter))
                {
                    i++;
                }
            })
            
        dispatch(updateState({
            key: "skullsFilterLenght",
            value: i,
        }))
    }
}

function checkFilter(cr,filter) {
    let flag = true;
    filter.map((f,i) => {
        if (f.value.length > 0 && flag) {
            if(f.name == 'Trait')
            {
               
                if(f.value.includes(5))
                {   console.log(5)
                    cr.attributes.map(at => {
                        if (at.trait_type == 'Hat' && flag) {
                            if (at.value.includes('none'))
                                flag = true
                            else {
                                flag = false;
                            }
                        }
                    })
                }
                if(f.value.includes(6))
                {
                    console.log(6)
                    cr.attributes.map(at => {
                        if (at.trait_type == 'Hat' && flag) {
                            if (at.value.includes('none'))
                                flag = false
                            else {
                                flag = true;
                            }
                        }
                    })
                } 
            }else{
                cr.attributes.map(at => {
                    if (at.trait_type == f.name && flag) {
                        if (f.value.includes(at.value))
                            flag = true
                        else {
                            flag = false;
                        }
                    }
                })
            }


        }
    })
    return flag;
}



export const resetSkullList = () => {
    return async (dispatch) => {
        let { gallery } = store.getState()
        let skullsList = null;

        dispatch(updateState({
            key: "skullsList",
            value: skullsList
        }))
    }
}

export const loadSkull= (i) => {
    return async (dispatch) => {
        let { gallery } = store.getState()
        const rawResult = await fetch( 'https://croskull.mypinata.cloud/ipfs/QmSrjCsmQ9e5m1HFYXRSYgxHi9K6u9a6DXRsWz7KWW5i6p/_metadata' );
        let skullsList = await rawResult.json();
        let skull = [];
        if(i)
        {
        skullsList.map(s =>{
            if(s.edition == i)
                skull.push(s);
        })
        dispatch(updateState({
            key: "skullsList",
            value: skull
        }))
    }
    }
}

export const getEbisusLink= (skull) => {
    return async (dispatch) => {
        let { gallery } = store.getState()
        const rawResult = await (await fetch(`https://api.ebisusbay.com/listings?collection=0xF87A517A5CaecaA03d7cCa770789BdB61e09e05F&state=0&page=1&pageSize=6666`)).json();
        let skullsList = await rawResult.listings;
        const link = 'https://app.ebisusbay.com/listing/';
        let linkGenerate = null;
        
        skullsList.map(s =>{
            if(s.nftId == skull.edition )
                linkGenerate = link+s.listingId
        })
        dispatch(updateState({
            key: "ebisusLink",
            value: linkGenerate
        }))
    }
}


  export const getAttributeNew = () =>{
    return async (dispatch) => {
    const rawResult = await fetch( 'https://croskull.mypinata.cloud/ipfs/QmSrjCsmQ9e5m1HFYXRSYgxHi9K6u9a6DXRsWz7KWW5i6p/_metadata' );
    let skullsList = await rawResult.json();
    let attributeList = [
        {name:'Background',value:[]},
        {name:'Skull',value:[]},
        {name:'Body',value:[]},
        {name:'Nose',value:[]},
        {name:'Eyes',value:[]},
        {name:'Hat',value:[]},
        {name:'Trait',value:[{name:5,cont:0},{name:6,cont:0}]}];
    let list;
    let flag = false;
    skullsList.map(skull =>{
        (skull.attributes).map( at =>{
            switch (at.trait_type) {
                case 'Background':
                    list=attributeList[0].value;
                        flag = false;
                        if(list.length>0){                
                        list.map(l =>{
                            if(l.name ==(at.value))
                            {
                                l.cont++;
                                flag = true;
                            }
                            
                        })
                    }
                        if(!flag)
                        {
                            attributeList[0].value.push({name:at.value,cont:1})
                        }
                        
                    break;
                case 'Skull':
                    list=attributeList[1].value;
                        flag = false;
                        if(list.length>0){                
                        list.map(l =>{
                            if(l.name ==(at.value))
                            {
                                l.cont++;
                                flag = true;
                            }
                            
                        })
                    }
                        if(!flag)
                        {
                            attributeList[1].value.push({name:at.value,cont:1})
                        }
                    break;
                case 'Body':
                    list=attributeList[2].value;
                        flag = false;
                        if(list.length>0){                
                        list.map(l =>{
                            if(l.name ==(at.value))
                            {
                                l.cont++;
                                flag = true;
                            }
                            
                        })
                    }
                        if(!flag)
                        {
                            attributeList[2].value.push({name:at.value,cont:1})
                        }
                    break;
                case 'Nose':
                    list=attributeList[3].value;
                        flag = false;
                        if(list.length>0){                
                        list.map(l =>{
                            if(l.name ==(at.value))
                            {
                                l.cont++;
                                flag = true;
                            }
                            
                        })
                    }
                        if(!flag)
                        {
                            attributeList[3].value.push({name:at.value,cont:1})
                        }
                    break;
                case 'Eyes':
                    list=attributeList[4].value;
                        flag = false;
                        if(list.length>0){                
                        list.map(l =>{
                            if(l.name ==(at.value))
                            {
                                l.cont++;
                                flag = true;
                            }
                            
                        })
                    }
                        if(!flag)
                        {
                            attributeList[4].value.push({name:at.value,cont:1})
                        }
                    break;
                case 'Hat':
                    list=attributeList[5].value;
                        flag = false;
                        if(list.length>0){                
                        list.map(l =>{
                            if(l.name ==(at.value))
                            {
                                l.cont++;
                                flag = true;
                                attributeList[6].value[1].cont++;
                            }
                            
                        })
                    }
                        if(!flag)
                        {   if(at.value=='none')
                            {
                                attributeList[6].value[0].cont++;
                            }
                            else{
                                attributeList[5].value.push({name:at.value,cont:1})
                            }
                        }
                    break;

                default:
                    break;
            }
            
            
        })
    })
    dispatch(updateState({
        key: "attributeList",
        value: attributeList
    }))


    }
  }