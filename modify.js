const preProcess = (f) => {
  f.tippecanoe = {
    layer: 'other',
    minzoom: 5,
    maxzoom: 5
  }
  // name
  if (
    f.properties.hasOwnProperty('en_name') ||
    f.properties.hasOwnProperty('int_name') ||
    f.properties.hasOwnProperty('name') ||
    f.properties.hasOwnProperty('ar_name')
  ) {
    let name = ''
    if (f.properties['en_name']) {
      name = f.properties['en_name']
    } else if (f.properties['int_name']) {
      name = f.properties['int_name']
    } else if (f.properties['name']) {
      name = f.properties['name']
    } else {
      name = f.properties['ar_name']
    }
    delete f.properties['en_name']
    delete f.properties['ar_name']
    delete f.properties['int_name']
    delete f.properties['name']
    f.properties.name = name
  }
  return f
}

const postProcess = (f) => {
if(f!==null){
  delete f.properties['_database']
  delete f.properties['_table']
}
  return f
}




const lut = {
  custom_planet_land_08_a: f => {
    f.tippecanoe = {
      layer: 'landmass',
      minzoom: 0,
      maxzoom: 5
    }
    delete f.properties['objectid']
    delete f.properties['fid_1']
    return f
  },
  custom_planet_ocean_08_a: f => {
    f.tippecanoe = {
      layer: 'ocean',
      minzoom: 0,
      maxzoom: 5
    }
    delete f.properties['objectid']
    delete f.properties['fid_1']
    return f
  },
  custom_ne_10m_bathymetry_a: f => {
    f.tippecanoe = {
      layer: 'bathymetry',
      minzoom: 2,
      maxzoom: 5
    }
    delete f.properties['objectid']
    delete f.properties['fid_1']
    return f
  },
  un_glc30_global_lc_ss_a: f => {
    f.tippecanoe = {
      layer: 'landcover',
      minzoom: 4,
      maxzoom: 5
    }
    delete f.properties['id']
    delete f.properties['objectid']
    delete f.properties['objectid_1']
    if (f.properties.gridcode == 80){ //only urban
//    if (f.properties.gridcode == 20 || f.properties.gridcode == 30 || f.properties.gridcode == 80){
    return f
    } else {
    return null
    }
  },
  unmap_bndl_l: f => {
    f.tippecanoe = {
      layer: 'bndl',
      minzoom: 5,
      maxzoom: 5
    }
    delete f.properties['objectid']
    delete f.properties['bdytyp_code']
    delete f.properties['iso3cd']
    delete f.properties['globalid']
  //no need admin 1 and 2 for ZL5 
  if (f.properties.bdytyp == '6' ||f.properties.bdytyp == '7') {
    return null
  } else {
    return f
  }
  },
  unmap_bndl05_l: f => {
    f.tippecanoe = {
      layer: 'bndl',
      minzoom: 3,
      maxzoom: 4
    }
    delete f.properties['objectid']
    delete f.properties['bdytyp_code']
    delete f.properties['iso3cd']
    delete f.properties['globalid']
  //no need admin 1 and 2 for small scale
  if (f.properties.bdytyp == '6' ||f.properties.bdytyp == '7' ||f.properties.bdytyp == '8') {
    return null
  } else {
    return f
  }
  },
  unmap_bndl25_l: f => {
    f.tippecanoe = {
      layer: 'bndl',
      minzoom: 0,
      maxzoom: 2
    }
    delete f.properties['objectid']
    delete f.properties['bdytyp_code']
    delete f.properties['iso3cd']
    delete f.properties['globalid']
  //no need admin 1 and 2 for small scale
  if (f.properties.bdytyp == '6' ||f.properties.bdytyp == '7'||f.properties.bdytyp == '8') {
    return null
  } else {
    return f
  }
  },
  custom_ne_rivers_lakecentrelines_l: f => {
    f.tippecanoe = {
      layer: 'un_water',
      maxzoom: 5
    }
  if (f.properties.scalerank == 1 || f.properties.scalerank == 2 || f.properties.scalerank == 3 || f.properties.scalerank == 4) {
    f.tippecanoe.minzoom = 3
  } else if (f.properties.scalerank == 5 || f.properties.scalerank == 6 || f.properties.scalerank == 7 ) {
    f.tippecanoe.minzoom = 4
  } else {
    f.tippecanoe.minzoom = 5
  }
    delete f.properties['objectid']
    delete f.properties['strokeweig']
    delete f.properties['dissolve']
    delete f.properties['note']
    return f
  },
  unmap_bnda_cty_anno_03_p: f => {
    f.tippecanoe = {
      layer: 'lab_cty',
      minzoom: 1,
      maxzoom: 2
    }
    if(f.properties.annotationclassid == 2){
      f.properties.labtyp = 5 // NSG
    } else if (f.properties.annotationclassid == 5) {
      f.properties.labtyp = 2 //SG
    } else {
      f.properties.labtyp = f.properties.annotationclassid
    }
   if (f.properties.status == 1) {
     return null
   } else {
     return f
   }
  },
  unmap_bnda_cty_anno_04_p: f => {
    f.tippecanoe = {
      layer: 'lab_cty',
      minzoom: 3,
      maxzoom: 3
    }
    f.properties.labtyp = f.properties.annotationclassid
   if (f.properties.status == 1) {
     return null
   } else {
     return f
   }
  },
  unmap_bnda_cty_anno_05_p: f => {
    f.tippecanoe = {
      layer: 'lab_cty',
      minzoom: 4,
      maxzoom: 4
    }
    f.properties.labtyp = f.properties.annotationclassid
   if (f.properties.status == 1) {
     return null
   } else {
     return f
   }
  },
  unmap_bnda_cty_anno_06_p: f => {
    f.tippecanoe = {
      layer: 'lab_cty',
      minzoom: 5,
      maxzoom: 5
    }
    f.properties.labtyp = f.properties.annotationclassid
   if (f.properties.status == 1) {
     return null
   } else {
     return f
   }
  },
  unmap_phyp_label_04_p: f => {
    f.tippecanoe = {
      layer: 'lab_water',
      minzoom: 3,
      maxzoom: 3
    }
  //Ocean minz 1, Bay Sea minz3
  if (f.properties.annotationclassid == 0 || f.properties.annotationclassid == 1) {
    f.tippecanoe.minzoom = 1
  } else if (f.properties.annotationclassid == 2 || f.properties.annotationclassid == 3 || f.properties.annotationclassid == 4 || f.properties.annotationclassid == 5) {
    f.tippecanoe.minzoom = 2
  } else {
    f.tippecanoe.minzoom = 4
  } 
    delete f.properties['zorder']
    delete f.properties['element']
    delete f.properties['bold']
    delete f.properties['bold_resolved']
    delete f.properties['italic']
    delete f.properties['italic_resolved']
    delete f.properties['underline']
    delete f.properties['underline_resolved']
    delete f.properties['verticalalignment']
    delete f.properties['horizontalalignment']
    delete f.properties['verticalalignment_resolved']
    delete f.properties['horizontalalignment_resolved']
    delete f.properties['xoffset']
    delete f.properties['yoffset']
    delete f.properties['angle']
    delete f.properties['fontleading']
    delete f.properties['wordspacing']
    delete f.properties['characterwidth']
    delete f.properties['characterspacing']
    delete f.properties['flipangle']
    delete f.properties['orid_fid']
    delete f.properties['override']
  if (f.properties.status == 1) {
    return null
  } else {
    return f
  }
  },
  unmap_phyp_label_06_p: f => {
    f.tippecanoe = {
      layer: 'lab_water',
      minzoom: 4,
      maxzoom: 5
    }
//   if (f.properties.annotationclassid == 6) {
//    f.tippecanoe.minzoom = 5
//  }
    delete f.properties['zorder']
    delete f.properties['element']
    delete f.properties['bold']
    delete f.properties['bold_resolved']
    delete f.properties['italic']
    delete f.properties['italic_resolved']
    delete f.properties['underline']
    delete f.properties['underline_resolved']
    delete f.properties['verticalalignment']
    delete f.properties['horizontalalignment']
    delete f.properties['verticalalignment_resolved']
    delete f.properties['horizontalalignment_resolved']
    delete f.properties['xoffset']
    delete f.properties['yoffset']
    delete f.properties['angle']
    delete f.properties['fontleading']
    delete f.properties['wordspacing']
    delete f.properties['characterwidth']
    delete f.properties['characterspacing']
    delete f.properties['flipangle']
    delete f.properties['orid_fid']
    delete f.properties['override']
  if (f.properties.status == 1) {
    return null
  } else {
    return f
  }
  },
  unmap_phyp_p: f => {
    f.tippecanoe = {
      layer: 'phyp_label',
      minzoom: 5,
      maxzoom: 5
    }
   if (f.properties.type == 4 && !/Sea|Ocean|Gulf/.test(f.properties.name) ){
     return f
   } else {
     return null
   }
  },
  unmap_wbya10_a: f => {
    f.tippecanoe = {
      layer: 'wbya10',
      minzoom: 2,
      maxzoom: 5
    }
//    delete f.properties['objectid']
    if (f.properties.areacalc > 2) {  //L1
      f.tippecanoe.minzoom = 0
    } else if (f.properties.areacalc > 1 && f.properties.lengthcalc > 5 && f.properties.name != 'Mackenzie River' ){  //L2-L3
      f.tippecanoe.minzoom = 1
    } else if (/Ontario/.test(f.properties.name)){  //L2-L3    
      f.tippecanoe.minzoom = 1
    } else if (f.properties.name == 'Lake Erie' ){  //L2-L3    
      f.tippecanoe.minzoom = 1
    } else if ([479, 161].includes(f.properties.objectid)) {  
      f.tippecanoe.minzoom = 1
    } else if (f.properties.areacalc > 0.13 && f.properties.cnty !='CAN'){ //L4 
      f.tippecanoe.minzoom = 3 //L5 is the same with L4
    } else if ([165, 479, 229, 231, 349].includes(f.properties.objectid)) {  
      f.tippecanoe.minzoom = 3
    } else if (f.properties.areacalc > 0.05 && f.properties.type == 1 && f.properties.perenniality != 2 ) {  //ZL6
      f.tippecanoe.minzoom = 5
    } else if (f.properties.areacalc > 0.15 && f.properties.lengthcalc > 4.5 && f.properties.perenniality != 2 ) {  //ZL6
      f.tippecanoe.minzoom = 5
    } else if ([2,3].includes(f.properties.type) && f.properties.lengthcalc > 10 && f.properties.perenniality != 2 ) {  //ZL6
      f.tippecanoe.minzoom = 5
    } else if (/Huai He|Nile River|Sor Mertvyy Kultu|Bahret Assad|Lake Nasser|Nun River|Sanaga|Lac Debo|Tagus River|Loire|Wisla|Waal|Rijn|Danube|Dnepr|Kiyevskoye Vodokhranilishche|Pura|Portnyagino|Kungasalakh|Suolama|Bykovskaya|Lulonga|Fimi|Busira|Ruki|Kainji Reservoir|Zambeze|Lago De Nicaragua|Missouri River|Niger|Pechora|Don|Rio Ica|Rock River|Tennessee River|Conowingo Reservoir/.test(f.properties.name) && !/Rio Guaviare/.test(f.properties.name) ) {  //ZL6
      f.tippecanoe.minzoom = 5
    } else if ([164745, 212173, 165788, 272373, 303258, 302487].includes(f.properties.objectid)) {  
      f.tippecanoe.minzoom = 5
    } else {   //L7
      f.tippecanoe.minzoom = 6
    }
    delete f.properties['fid_1']
    delete f.properties['lengthcalc']
    return f
  },
  unmap_wbya_label_05_p: f => {
    f.tippecanoe = {
      layer: 'lab_inwater',
      minzoom: 4,
      maxzoom: 4
    }
    if (f.properties.status == 1) {
      return null
    } else {
      return f
    }
  },
  unmap_wbya_label_06_p: f => {
    f.tippecanoe = {
      layer: 'lab_inwater',
      minzoom: 5,
      maxzoom: 5
    }
    if (f.properties.status == 1) {
      return null
    } else {
      return f
    }
  },
  unmap_dral10_l: f => {
    f.tippecanoe = {
      layer: 'dral10',
      minzoom: 5,
      maxzoom: 5
    }
    if (f.properties.lengthcalc >= 13.6 && f.properties.type == 1) { //L4
      f.tippecanoe.minzoom = 3 
    } else if (/Yukon|Saskatchewan|Missouri|Mississip|Parana|Araguaia|Xingu|Maranon|Amazonas|Oka|Duna|Don|Volga|Odra|Wisla|Rijn|Rhein|Loire|Indus|Aldan|Lena|Ket|Ob|Gang|Nil|Al Bahr|Abay Wenz|Congo|Niger|Benue|Benoue|Uele|Lualaba|Zambeze|Zambezi|Orange|Brahmaputra|Yangtze|Huang He/.test(f.properties.name)) { //L5
      f.tippecanoe.minzoom = 3 //may need to add a filter with objectid
    } else if ([2437, 2954, 2955, 3034, 3060, 3090, 3103, 3300, 3311, 3494, 2270, 2990, 1079].includes(f.properties.objectid)) {  //L4
      f.tippecanoe.minzoom = 3
    } else if (f.properties.lengthcalc >= 9.2 && f.properties.type == 1) { //L5
      f.tippecanoe.minzoom = 4
    } else if (/Slave|Ob|Malaya Ob|Kuonamka|Odra|Weser|Pryp|Wisla|Nemunas|Daugava|Oka|Dnipro|Prut|Duna|Rhin|Rijn|Seine|Loire|Don|Volga|Sirdar|Indus|Argun|Kolyma|Alazeya|Indigirka|Aldan|Lena|Khatanga|Kheta|Pyasina|Heilong|Amur|Yangtze|Huang|Brahmaputra|Gang|Ayeyarwady|Menam|Mekong|Murray|Rhein|Parana|Maranon|Araguaia|Xingu|Mamore|Japura|Colorado|Hudson|Missouri|Columbia|Snake|Ohio|Mississip|Yukon|Red|Peace|Kasai|Saskatchewan|Cuanza|Wenz|Chari|Benue|Orange|Benoue|Logone|Senegal|Webi|Zambe|Rovuma|Bahr Aouk|Chobe|Kwando/.test(f.properties.name)) { //L5
      f.tippecanoe.minzoom = 4
    } else if (['Al Bahr al Azraq','Mbomou','Zaire/Congo','Oubangui','Nile','Nahr an Nil','Congo','Rio Tapajos','Rio Madeira',' Rio Tapajos','Rio Amazonas','Al Bahr al Abyad','Niger'].includes(f.tippecanoe.name)){
      f.tippecanoe.minzoom = 4 
    } else if ([1100, 3205, 3196, 3185, 3128, 3052, 3494, 3065, 3058, 2516, 3069, 3074, 3076, 3077, 3078, 3034, 3060, 3090, 3103, 2957, 2955, 2954, 2212, 3464, 2939, 3311, 3300, 2054, 2324, 286, 297, 1457, 2496, 2349, 2208, 2339, 1837, 2437, 2270, 2990, 1079].includes(f.properties.objectid)) {  //L5
      f.tippecanoe.minzoom = 4  
    } else if (/Zambeze|Esil|Odra|Weser|Colorado|Okavango|Zambezi|Salado|Kwando|Chobe|Grande|Brazos/.test(f.properties.name)) {  //L6
      f.tippecanoe.minzoom = 5      
    } else if ([2846, 3482, 1100, 3060, 3456, 3102, 3022, 1093, 3101, 2325, 2302, 2310, 3445, 2445, 3363, 3332, 3335, 3337, 2442, 2435, 2054, 2436, 2188, 2207, 2794, 2539, 2520, 2679, 2538, 2511, 1654, 1175, 592, 432, 967, 552, 558, 2511, 2266, 2339, 2334, 2142, 2230, 3526, 3572, 2349, 2208, 2235, 2978].includes(f.properties.objectid)) {  //L6
      f.tippecanoe.minzoom = 5  
    } else {   //L7 -over
      f.tippecanoe.minzoom = 6 //other --> no data
    }
//    delete f.properties['objectid']
    delete f.properties['fid_1']
    return f
  },
  unmap_popp_p: f => {
    f.tippecanoe = {
      layer: 'un_popp',
      minzoom: 3,
      maxzoom: 5
    }
   if (f.properties.cartolb === 'Alofi' ||f.properties.cartolb === 'Avarua' ) {
//   if (f.properties.cartolb === 'Alofi' ||f.properties.cartolb === 'Avarua' ||f.properties.cartolb === 'Sri Jayewardenepura Kotte' ) {
     return null
    } else if (f.properties.poptyp == 1 || f.properties.poptyp == 2) {
     return f
    } else if (f.properties.poptyp == 3 && f.properties.scl_id == 10) {
     return f
    } else {
     return null
    } 
  } 
}
module.exports = (f) => {
  return postProcess(lut[f.properties._table](preProcess(f)))
}
