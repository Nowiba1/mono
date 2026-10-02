import React from 'react';

interface LandmarkIconProps {
  landmarkKey: string;
  size?: number;
  className?: string;
}

export const LandmarkIcon: React.FC<LandmarkIconProps> = ({
  landmarkKey,
  size = 36,
  className = '',
}) => {
  const renderSvg = () => {
    switch (landmarkKey) {
      // 0: GO - African Union Gateway
      case 'african_gateway':
      case 'city_gate':
      case 'global_gateway':
        return (
          <g>
            <circle cx="24" cy="24" r="21" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="4 2" />
            {/* Golden arch with African rising sun */}
            <path d="M10,40 Q24,10 38,40" stroke="#f59e0b" strokeWidth="3" fill="none" />
            <circle cx="24" cy="22" r="7" fill="#facc15" />
            {/* Olive branch laurels */}
            <path d="M14,34 Q10,24 16,16" stroke="#10b981" strokeWidth="2" fill="none" />
            <path d="M34,34 Q38,24 32,16" stroke="#10b981" strokeWidth="2" fill="none" />
            <polygon points="24,12 28,20 20,20" fill="#ffffff" />
          </g>
        );

      // 1: Alexandria Qaitbay Citadel (Egypt)
      case 'alexandria_qaitbay':
      case 'santorini_cliffside':
      case 'cobblestone_wharf':
        return (
          <g>
            {/* Sea water */}
            <path d="M4,34 Q24,30 44,34 L44,44 L4,44 Z" fill="#0284c7" />
            {/* Mediterranean Stone Fortress */}
            <rect x="10" y="16" width="28" height="20" fill="#d4b996" stroke="#8c6d46" strokeWidth="1.5" />
            {/* Turrets & crenellations */}
            <rect x="8" y="12" width="8" height="8" fill="#bfa07a" />
            <rect x="32" y="12" width="8" height="8" fill="#bfa07a" />
            <rect x="20" y="10" width="8" height="10" fill="#a88963" />
            <polygon points="24,4 28,10 20,10" fill="#78350f" />
            <rect x="22" y="26" width="4" height="10" rx="2" fill="#0f172a" />
          </g>
        );

      // 3: Aswan Philae Island Temple (Egypt)
      case 'aswan_philae':
      case 'venice_canal':
      case 'pelican_pier':
        return (
          <g>
            {/* Nile river water */}
            <path d="M4,36 Q24,32 44,36 L44,44 L4,44 Z" fill="#0369a1" />
            {/* Temple Pylon & Columns */}
            <polygon points="8,16 18,16 16,36 10,36" fill="#ca8a04" stroke="#78350f" strokeWidth="1" />
            <polygon points="30,16 40,16 38,36 32,36" fill="#ca8a04" stroke="#78350f" strokeWidth="1" />
            <rect x="18" y="22" width="12" height="14" fill="#a16207" />
            <path d="M20,36 L20,26 Q24,22 28,26 L28,36 Z" fill="#0f172a" />
            {/* Nile Felucca sail in foreground */}
            <polygon points="36,28 42,20 42,34" fill="#ffffff" opacity="0.9" />
          </g>
        );

      // 5: Al Boraq High-Speed Rail (Morocco)
      case 'transit_al_boraq':
      case 'transit_shinkansen':
      case 'transit_skyrail':
        return (
          <g>
            {/* Sleek aerodynamic bullet train */}
            <path d="M6,22 L32,22 Q42,22 42,28 L38,36 L6,36 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="6" y1="26" x2="40" y2="26" stroke="#facc15" strokeWidth="2" />
            <rect x="14" y="24" width="6" height="4" rx="1" fill="#0f172a" />
            <rect x="24" y="24" width="6" height="4" rx="1" fill="#0f172a" />
            <line x1="4" y1="38" x2="44" y2="38" stroke="#64748b" strokeWidth="3" />
          </g>
        );

      // 6: Marrakech Jemaa el-Fnaa (Morocco)
      case 'marrakech_jemaa':
      case 'shibuya_crossing':
      case 'arcade_avenue':
        return (
          <g>
            {/* Terracotta Medina & Koutoubia minaret */}
            <rect x="20" y="8" width="10" height="28" fill="#b45309" stroke="#78350f" strokeWidth="1" />
            <polygon points="25,2 29,8 21,8" fill="#d97706" />
            <circle cx="25" cy="14" r="1.5" fill="#fde047" />
            {/* Moroccan arched gates and market tents */}
            <polygon points="6,34 12,24 18,34" fill="#dc2626" />
            <polygon points="30,34 36,24 42,34" fill="#059669" />
            <rect x="10" y="34" width="28" height="6" fill="#78350f" />
          </g>
        );

      // 8: Casablanca Hassan II Mosque (Morocco)
      case 'casablanca_hassan':
      case 'akihabara_electric':
      case 'hologram_boulevard':
        return (
          <g>
            {/* Ocean waves */}
            <path d="M4,38 Q24,34 44,38" stroke="#0284c7" strokeWidth="2" fill="none" />
            {/* Grand Minaret with turquoise crest */}
            <rect x="19" y="6" width="10" height="30" fill="#f8fafc" stroke="#0891b2" strokeWidth="1.5" />
            <polygon points="24,1 28,6 20,6" fill="#06b6d4" />
            <line x1="24" y1="6" x2="24" y2="36" stroke="#06b6d4" strokeWidth="1" />
            {/* Mosque dome */}
            <ellipse cx="12" cy="28" rx="6" ry="6" fill="#0891b2" />
            <ellipse cx="36" cy="28" rx="6" ry="6" fill="#0891b2" />
          </g>
        );

      // 9: Chefchaouen Blue Pearl (Morocco)
      case 'chefchaouen_blue':
      case 'shinjuku_skytower':
      case 'synthwave_plaza':
        return (
          <g>
            {/* Blue mountain alley houses & archway */}
            <rect x="6" y="16" width="16" height="24" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="26" y="12" width="16" height="28" rx="2" fill="#0369a1" stroke="#67e8f9" strokeWidth="1.5" />
            {/* Moorish horseshoe arch in center */}
            <path d="M16,40 L16,28 Q24,20 32,28 L32,40 Z" fill="#0f172a" stroke="#bae6fd" strokeWidth="1.5" />
            {/* Hanging flower pots */}
            <circle cx="12" cy="22" r="2.5" fill="#f43f5e" />
            <circle cx="36" cy="18" r="2.5" fill="#f59e0b" />
          </g>
        );

      // 10: Interpol Detention
      case 'city_detention':
        return (
          <g>
            <rect x="8" y="10" width="32" height="30" fill="#0f172a" stroke="#64748b" strokeWidth="2" rx="3" />
            <line x1="15" y1="10" x2="15" y2="40" stroke="#94a3b8" strokeWidth="2.5" />
            <line x1="24" y1="10" x2="24" y2="40" stroke="#94a3b8" strokeWidth="2.5" />
            <line x1="33" y1="10" x2="33" y2="40" stroke="#94a3b8" strokeWidth="2.5" />
            <circle cx="20" cy="26" r="3.5" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="28" cy="26" r="3.5" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="23.5" y1="26" x2="24.5" y2="26" stroke="#f59e0b" strokeWidth="1.5" />
          </g>
        );

      // 11: Carthage Imperial Ruins (Tunisia)
      case 'carthage_ruins':
      case 'montmartre_walk':
      case 'mosaic_row':
        return (
          <g>
            {/* Roman Antonine Corinthian columns overlooking Mediterranean */}
            <rect x="8" y="14" width="6" height="24" fill="#e2e8f0" stroke="#c026d3" strokeWidth="1" />
            <rect x="21" y="10" width="6" height="28" fill="#e2e8f0" stroke="#c026d3" strokeWidth="1" />
            <rect x="34" y="14" width="6" height="24" fill="#e2e8f0" stroke="#c026d3" strokeWidth="1" />
            <rect x="6" y="10" width="36" height="5" rx="1" fill="#c026d3" />
            {/* Punic Mediterranean sea background */}
            <path d="M4,38 Q24,34 44,38" stroke="#38bdf8" strokeWidth="2" fill="none" />
          </g>
        );

      // 12: Aswan High Dam Hydro Core (Egypt)
      case 'aswan_dam':
      case 'hoover_dam':
      case 'geothermal_core':
        return (
          <g>
            {/* Curved massive concrete dam and hydro-power lightning */}
            <path d="M8,14 Q24,20 40,14 L36,40 Q24,34 12,40 Z" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
            <polygon points="26,16 18,27 24,27 22,38 30,25 24,25" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <line x1="14" y1="22" x2="34" y2="22" stroke="#bae6fd" strokeWidth="1" strokeDasharray="2 2" />
          </g>
        );

      // 13: Algiers Casbah Citadel (Algeria)
      case 'algiers_casbah':
      case 'champs_elysees':
      case 'canvas_court':
        return (
          <g>
            {/* Whitewashed Ottoman hillside architecture & bay */}
            <rect x="8" y="18" width="14" height="20" rx="2" fill="#f8fafc" stroke="#db2777" strokeWidth="1.5" />
            <rect x="26" y="14" width="14" height="24" rx="2" fill="#f8fafc" stroke="#db2777" strokeWidth="1.5" />
            <polygon points="8,18 15,12 22,18" fill="#be185d" />
            <polygon points="26,14 33,8 40,14" fill="#be185d" />
            <circle cx="15" cy="24" r="2" fill="#0369a1" />
            <circle cx="33" cy="22" r="2" fill="#0369a1" />
            <path d="M4,40 Q24,36 44,40" stroke="#0284c7" strokeWidth="2" fill="none" />
          </g>
        );

      // 14: Constantine Sidi M'Cid Bridge (Algeria)
      case 'constantine_bridge':
      case 'louvre_palace':
      case 'sculpture_square':
        return (
          <g>
            {/* Rhumel deep canyon rock cliffs */}
            <polygon points="4,10 14,10 10,40 4,40" fill="#78350f" />
            <polygon points="34,10 44,10 44,40 38,40" fill="#78350f" />
            {/* High suspension suspension bridge across gorge */}
            <line x1="8" y1="20" x2="40" y2="20" stroke="#ec4899" strokeWidth="2.5" />
            <path d="M8,10 Q24,24 40,10" stroke="#f472b6" strokeWidth="1.5" fill="none" />
            <line x1="16" y1="16" x2="16" y2="20" stroke="#f472b6" strokeWidth="1" />
            <line x1="24" y1="18" x2="24" y2="20" stroke="#f472b6" strokeWidth="1" />
            <line x1="32" y1="16" x2="32" y2="20" stroke="#f472b6" strokeWidth="1" />
          </g>
        );

      // 15: Trans-Sahara Express (Continental Rail)
      case 'transit_trans_sahara':
      case 'transit_eurostar':
      case 'transit_ferry':
        return (
          <g>
            {/* Desert train traversing golden sand dunes */}
            <path d="M4,34 Q20,28 36,36 L44,40 L4,40 Z" fill="#d97706" opacity="0.6" />
            <rect x="8" y="18" width="32" height="16" rx="4" fill="#0f172a" stroke="#ca8a04" strokeWidth="2" />
            <circle cx="16" cy="32" r="3" fill="#facc15" />
            <circle cx="26" cy="32" r="3" fill="#facc15" />
            <circle cx="34" cy="32" r="3" fill="#facc15" />
            <polygon points="34,12 38,18 30,18" fill="#ea580c" />
          </g>
        );

      // 16: Ghadames Pearl Oasis (Libya)
      case 'ghadames_oasis':
      case 'kew_gardens':
      case 'botanical_promenade':
        return (
          <g>
            {/* Sahara white covered city alleys with rooftop terraces */}
            <rect x="8" y="16" width="32" height="22" rx="3" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
            <polygon points="8,16 16,10 24,16" fill="#d97706" />
            <polygon points="24,16 32,10 40,16" fill="#d97706" />
            {/* Date palm tree */}
            <path d="M14,38 L14,24" stroke="#78350f" strokeWidth="2" />
            <circle cx="14" cy="22" r="5" fill="#15803d" />
          </g>
        );

      // 18: Leptis Magna Roman Forum (Libya)
      case 'leptis_magna':
      case 'westminster_court':
      case 'glasshouse_alley':
        return (
          <g>
            {/* Arch of Septimius Severus */}
            <rect x="8" y="12" width="32" height="26" rx="2" fill="#d97706" stroke="#fde047" strokeWidth="1.5" />
            <path d="M16,38 L16,24 Q24,18 32,24 L32,38 Z" fill="#0f172a" stroke="#fef08a" strokeWidth="1.5" />
            <polygon points="6,12 24,4 42,12" fill="#b45309" />
          </g>
        );

      // 19: Richat Eye of the Sahara (Mauritania)
      case 'richat_structure':
      case 'tower_bridge':
      case 'solar_terraces':
        return (
          <g>
            {/* Concentric geological rings of the Sahara Eye */}
            <circle cx="24" cy="24" r="18" fill="#78350f" stroke="#d97706" strokeWidth="2" />
            <circle cx="24" cy="24" r="13" fill="#b45309" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="24" cy="24" r="8" fill="#d97706" stroke="#fde047" strokeWidth="2" />
            <circle cx="24" cy="24" r="3" fill="#0284c7" />
          </g>
        );

      // 20: Serengeti Wildlife Haven (Free Parking)
      case 'serengeti_haven':
      case 'free_haven':
        return (
          <g>
            {/* Savannah sunrise with iconic Acacia tree silhouette */}
            <circle cx="24" cy="24" r="18" fill="#065f46" stroke="#34d399" strokeWidth="2" />
            <circle cx="24" cy="18" r="8" fill="#f59e0b" />
            {/* Acacia silhouette */}
            <path d="M24,36 L24,24" stroke="#0f172a" strokeWidth="3" />
            <ellipse cx="24" cy="22" rx="14" ry="4" fill="#0f172a" />
          </g>
        );

      // 21: Lalibela Rock Monoliths (Ethiopia)
      case 'lalibela_church':
      case 'giza_plateau':
      case 'sunstone_way':
        return (
          <g>
            {/* Bete Giyorgis rock-hewn Greek cross carved into earth */}
            <rect x="8" y="8" width="32" height="32" rx="4" fill="#451a03" stroke="#dc2626" strokeWidth="1.5" />
            {/* Equal-arm cross church roof */}
            <rect x="18" y="12" width="12" height="24" fill="#b91c1c" stroke="#fca5a5" strokeWidth="1" />
            <rect x="12" y="18" width="24" height="12" fill="#b91c1c" stroke="#fca5a5" strokeWidth="1" />
            <circle cx="24" cy="24" r="3" fill="#facc15" />
          </g>
        );

      // 23: Nairobi Savannah Horizon (Kenya)
      case 'nairobi_skyline':
      case 'palm_jumeirah':
      case 'crimson_citadel':
        return (
          <g>
            {/* Modern glass towers with acacia tree foreground */}
            <rect x="10" y="14" width="8" height="24" fill="#991b1b" stroke="#ef4444" strokeWidth="1" />
            <rect x="20" y="8" width="10" height="30" fill="#7f1d1d" stroke="#f87171" strokeWidth="1.5" />
            <rect x="32" y="16" width="6" height="22" fill="#991b1b" stroke="#ef4444" strokeWidth="1" />
            {/* Acacia silhouette */}
            <path d="M10,38 L10,28 Q14,24 16,28" stroke="#15803d" strokeWidth="2" fill="none" />
          </g>
        );

      // 24: Mount Kilimanjaro Summit (Tanzania/Kenya)
      case 'mount_kilimanjaro':
      case 'burj_horizon':
      case 'phoenix_overlook':
        return (
          <g>
            {/* Massive stratovolcano with snowcapped white peak */}
            <polygon points="24,6 42,38 6,38" fill="#7f1d1d" stroke="#fca5a5" strokeWidth="1.5" />
            {/* White glacier cap */}
            <polygon points="24,6 30,16 26,14 22,18 18,16" fill="#f8fafc" />
            <circle cx="36" cy="12" r="4" fill="#facc15" />
          </g>
        );

      // 25: Blue Nile Continental Rail
      case 'transit_blue_nile':
      case 'transit_orient':
      case 'transit_metro':
        return (
          <g>
            {/* Streamlined blue train crossing grand river bridge */}
            <rect x="8" y="16" width="32" height="16" rx="5" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
            <circle cx="16" cy="24" r="3" fill="#ffffff" />
            <circle cx="32" cy="24" r="3" fill="#ffffff" />
            <path d="M4,38 Q24,32 44,38" stroke="#38bdf8" strokeWidth="3" fill="none" />
          </g>
        );

      // 26: Luxor Karnak Grand Temple (Egypt)
      case 'luxor_karnak':
      case 'colosseum_vista':
      case 'starlight_boulevard':
        return (
          <g>
            {/* Monumental Hypostyle Papyrus columns & avenue */}
            <rect x="8" y="14" width="7" height="24" fill="#ca8a04" stroke="#78350f" strokeWidth="1" />
            <rect x="19" y="10" width="10" height="28" fill="#ca8a04" stroke="#78350f" strokeWidth="1.5" />
            <rect x="33" y="14" width="7" height="24" fill="#ca8a04" stroke="#78350f" strokeWidth="1" />
            {/* Papyrus capital crowns */}
            <ellipse cx="11.5" cy="14" rx="5" ry="3" fill="#fde047" />
            <ellipse cx="24" cy="10" rx="7" ry="4" fill="#fde047" />
            <ellipse cx="36.5" cy="14" rx="5" ry="3" fill="#fde047" />
          </g>
        );

      // 27: Abu Simbel Sun Temples (Egypt)
      case 'abu_simbel':
      case 'piazza_san_marco':
      case 'aurora_terrace':
        return (
          <g>
            {/* Four Colossal Ramses statues carved in mountain cliff */}
            <rect x="6" y="12" width="36" height="26" fill="#854d0e" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="11" cy="18" r="3" fill="#fde047" />
            <circle cx="19" cy="18" r="3" fill="#fde047" />
            <circle cx="29" cy="18" r="3" fill="#fde047" />
            <circle cx="37" cy="18" r="3" fill="#fde047" />
            <polygon points="24,24 27,38 21,38" fill="#0f172a" />
          </g>
        );

      // 28: Noor Ouarzazate Solar Complex (Morocco)
      case 'noor_solar':
      case 'solar_array':
      case 'aqueduct_tower':
        return (
          <g>
            {/* Giant central solar tower with radiating heliostats in desert */}
            <rect x="21" y="8" width="6" height="28" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="24" cy="8" r="4" fill="#facc15" stroke="#fef08a" strokeWidth="2" />
            {/* Radiating solar mirrors */}
            <polygon points="8,26 16,22 14,36 6,38" fill="#0ea5e9" />
            <polygon points="32,22 40,26 42,38 34,36" fill="#0ea5e9" />
          </g>
        );

      // 29: Giza Great Pyramids & Sphinx (Egypt)
      case 'giza_pyramids':
      case 'vatican_belvedere':
      case 'observatory_way':
        return (
          <g>
            {/* The Great Pyramids and Sphinx */}
            <polygon points="20,10 36,36 4,36" fill="#ca8a04" stroke="#fde047" strokeWidth="1.5" />
            <polygon points="20,10 28,36 4,36" fill="#eab308" />
            <polygon points="32,20 44,36 24,36" fill="#a16207" />
            {/* Sphinx silhouette */}
            <ellipse cx="14" cy="32" rx="4" ry="3" fill="#78350f" />
            <circle cx="16" cy="28" r="2.5" fill="#fef08a" />
          </g>
        );

      // 30: Continental Extradition
      case 'detain_order':
        return (
          <g>
            <circle cx="24" cy="24" r="18" fill="#991b1b" stroke="#f87171" strokeWidth="2" />
            <polygon points="24,8 36,16 32,34 24,40 16,34 12,16" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
            <text x="24" y="28" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle">!</text>
          </g>
        );

      // 31: Victoria Falls Thunder Mist (Zambezi)
      case 'victoria_falls':
      case 'wall_street':
      case 'vantage_tower':
        return (
          <g>
            {/* Massive curtain of falling water with rising mist */}
            <rect x="6" y="8" width="36" height="12" fill="#065f46" />
            <path d="M8,20 L8,38 M14,20 L14,38 M20,20 L20,38 M26,20 L26,38 M32,20 L32,38 M38,20 L38,38" stroke="#38bdf8" strokeWidth="2.5" />
            {/* Rainbow over water */}
            <path d="M10,24 Q24,14 38,24" stroke="#facc15" strokeWidth="1.5" fill="none" opacity="0.8" />
          </g>
        );

      // 32: Serengeti Savannah Plain (Tanzania/Kenya)
      case 'serengeti_plain':
      case 'hudson_yards':
      case 'apex_spire':
        return (
          <g>
            {/* African golden savannah with lion & baobab tree */}
            <rect x="4" y="26" width="40" height="16" fill="#064e3b" />
            <circle cx="34" cy="14" r="6" fill="#f59e0b" />
            {/* Baobab tree */}
            <path d="M12,38 L12,22 Q16,16 20,22" stroke="#78350f" strokeWidth="4" fill="none" />
            <circle cx="16" cy="18" r="6" fill="#15803d" />
          </g>
        );

      // 34: Cape Town Table Mountain (South Africa)
      case 'table_mountain':
      case 'central_park_south':
      case 'sovereign_exchange':
        return (
          <g>
            {/* Flat-topped mountain plateau overlooking Atlantic */}
            <polygon points="6,24 14,14 34,14 42,24 42,38 6,38" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />
            {/* Tablecloth cloud cover */}
            <ellipse cx="24" cy="14" rx="14" ry="3" fill="#f8fafc" opacity="0.85" />
            <path d="M4,38 Q24,34 44,38" stroke="#0284c7" strokeWidth="2" fill="none" />
          </g>
        );

      // 35: Cape to Cairo Continental Rail
      case 'transit_cape_cairo':
      case 'transit_monorail':
        return (
          <g>
            <rect x="6" y="16" width="36" height="14" rx="7" fill="#0284c7" stroke="#93c5fd" strokeWidth="2" />
            <rect x="14" y="20" width="8" height="6" fill="#ffffff" rx="1" />
            <rect x="26" y="20" width="8" height="6" fill="#ffffff" rx="1" />
            <line x1="4" y1="36" x2="44" y2="36" stroke="#475569" strokeWidth="4" />
          </g>
        );

      // 37: Zanzibar Stone Town Palace (Tanzania)
      case 'zanzibar_palace':
      case 'monte_carlo':
      case 'imperial_vista':
        return (
          <g>
            {/* Sultan House of Wonders with carved wooden brass doors */}
            <rect x="8" y="14" width="32" height="26" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="2" rx="2" />
            <polygon points="24,4 32,14 16,14" fill="#facc15" stroke="#eab308" strokeWidth="1.5" />
            <rect x="20" y="26" width="8" height="14" rx="4" fill="#ca8a04" />
            <circle cx="24" cy="32" r="1.5" fill="#fde047" />
          </g>
        );

      // 39: Seychelles Anse Source d'Argent
      case 'seychelles_granite':
      case 'geneva_palace':
      case 'celestial_palace':
        return (
          <g>
            {/* Turquoise lagoon with iconic pink granite boulders and palm */}
            <path d="M4,32 Q24,26 44,32 L44,44 L4,44 Z" fill="#0284c7" />
            {/* Granite giant monoliths */}
            <ellipse cx="14" cy="28" rx="8" ry="10" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
            <ellipse cx="32" cy="26" rx="10" ry="12" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Palm tree */}
            <path d="M22,34 Q26,20 28,14" stroke="#78350f" strokeWidth="2" fill="none" />
            <ellipse cx="28" cy="14" rx="6" ry="3" fill="#10b981" />
          </g>
        );

      // Special Decks & Taxes
      case 'vault_chest':
        return (
          <g>
            <rect x="8" y="16" width="32" height="22" rx="4" fill="#854d0e" stroke="#facc15" strokeWidth="2" />
            <path d="M8,22 Q24,14 40,22" stroke="#facc15" strokeWidth="2" fill="none" />
            <circle cx="24" cy="28" r="3.5" fill="#facc15" />
            <line x1="24" y1="28" x2="24" y2="33" stroke="#0f172a" strokeWidth="1.5" />
          </g>
        );

      case 'destiny_beacon':
        return (
          <g>
            <circle cx="24" cy="24" r="16" fill="#581c87" stroke="#c084fc" strokeWidth="2" />
            <polygon points="24,10 27,20 37,24 27,28 24,38 21,28 11,24 21,20" fill="#fde047" />
          </g>
        );

      case 'city_tax':
        return (
          <g>
            <circle cx="24" cy="24" r="16" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <text x="24" y="31" fill="#facc15" fontSize="20" fontWeight="bold" textAnchor="middle">$</text>
          </g>
        );

      case 'luxury_tax':
        return (
          <g>
            <polygon points="24,8 38,18 24,40 10,18" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            <polygon points="24,8 30,18 24,40 18,18" fill="#bae6fd" />
            <circle cx="24" cy="22" r="3" fill="#fde047" />
          </g>
        );

      default:
        return (
          <circle cx="24" cy="24" r="14" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
        );
    }
  };

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      aria-label={`Landmark icon: ${landmarkKey}`}
      role="img"
    >
      {renderSvg()}
    </svg>
  );
};
