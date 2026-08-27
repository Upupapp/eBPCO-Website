import { ALL_PERMIT_TYPES, PermitType } from './permit.model';
import { RelatedApprovalReferences } from './technical-data.model';
import { SignatoryRole } from './authorized-signatories.config';

export type DocumentSectionKey =
  | 'officialHeader'
  | 'permitTitle'
  | 'permitNumber'
  | 'applicantOwner'
  | 'property'
  | 'project'
  | 'technicalSummary'
  | 'equipmentTable'
  | 'professional'
  | 'assessment'
  | 'relatedPermits'
  | 'conditions'
  | 'approvalSignature'
  | 'qr'
  | 'footer';

export interface DocumentFieldDef {
  /** Dot-path into ApplicationTechnicalData, e.g. 'families.electrical.connectedLoadKva'. */
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  unit?: string;
  options?: string[];
}

export type EquipmentFamilyKey = 'electrical' | 'mechanical' | 'sanitary' | 'plumbing' | 'electronics';

export interface EquipmentTableConfig {
  family: EquipmentFamilyKey;
  /** Dot-path to the array field, e.g. 'families.electrical.equipment'. */
  arrayFieldId: string;
  title: string;
  columns: { key: string; label: string }[];
}

export interface AgencyHeaderConfig {
  line1: string;
  line2: string;
  line3?: string;
  officeLine: string;
  sealAssetPath: string;
}

export interface DocumentTypeConfig {
  permitType: PermitType;
  agencyHeader: AgencyHeaderConfig;
  documentTitle: string;
  documentSubtitle?: string;
  sections: DocumentSectionKey[];
  technicalFields: DocumentFieldDef[];
  equipmentTable?: EquipmentTableConfig;
  requiredForIssuance: string[];
  requiredRelatedApprovals: (keyof RelatedApprovalReferences)[];
  signatoryRole: SignatoryRole;
}

const OBO_HEADER: AgencyHeaderConfig = {
  line1: 'Republic of the Philippines',
  line2: 'Province of Sorsogon',
  line3: 'Municipality of Castilla',
  officeLine: 'Office of the Municipal Engineer / Building Official',
  sealAssetPath: '/assets/logos/logo.png',
};

const ZONING_HEADER: AgencyHeaderConfig = {
  line1: 'Republic of the Philippines',
  line2: 'Province of Sorsogon',
  line3: 'Municipality of Castilla',
  officeLine: 'Municipal Planning and Development Office (Zoning Section)',
  sealAssetPath: '/assets/logos/logo.png',
};

const BFP_HEADER: AgencyHeaderConfig = {
  line1: 'Republic of the Philippines',
  line2: 'Department of the Interior and Local Government',
  line3: 'Bureau of Fire Protection',
  officeLine: 'Castilla Fire Station — Sorsogon Provincial Office, Region V',
  sealAssetPath: '/assets/logos/bfp-seal.png',
};

const STANDARD_SECTIONS: DocumentSectionKey[] = [
  'officialHeader',
  'permitTitle',
  'permitNumber',
  'applicantOwner',
  'property',
  'project',
  'technicalSummary',
  'professional',
  'relatedPermits',
  'assessment',
  'conditions',
  'approvalSignature',
  'qr',
  'footer',
];

const EQUIPMENT_SECTIONS: DocumentSectionKey[] = [
  'officialHeader',
  'permitTitle',
  'permitNumber',
  'applicantOwner',
  'property',
  'project',
  'technicalSummary',
  'equipmentTable',
  'professional',
  'relatedPermits',
  'assessment',
  'conditions',
  'approvalSignature',
  'qr',
  'footer',
];

const BFP_SECTIONS: DocumentSectionKey[] = [
  'officialHeader',
  'permitTitle',
  'permitNumber',
  'applicantOwner',
  'project',
  'technicalSummary',
  'relatedPermits',
  'assessment',
  'conditions',
  'approvalSignature',
  'qr',
  'footer',
];

const COMMON_PROJECT_FIELDS: DocumentFieldDef[] = [
  { id: 'common.floorAreaSqm', label: 'Total Floor Area', type: 'number', unit: 'sqm' },
  { id: 'common.buildingFootprintSqm', label: 'Building Footprint', type: 'number', unit: 'sqm' },
  { id: 'common.projectCostCentavos', label: 'Estimated Project / Construction Cost', type: 'number', unit: 'PHP' },
];

const BUILDING_WORKS_FIELDS: DocumentFieldDef[] = [
  { id: 'families.buildingWorks.numberOfStoreys', label: 'Number of Storeys', type: 'number' },
  { id: 'families.buildingWorks.buildingHeightMeters', label: 'Building Height', type: 'number', unit: 'm' },
  { id: 'families.buildingWorks.buildingUseOrOccupancy', label: 'Occupancy / Use', type: 'text' },
  { id: 'families.buildingWorks.occupancyClassification', label: 'Occupancy Classification', type: 'text' },
  { id: 'families.buildingWorks.typeOfConstruction', label: 'Type of Construction', type: 'text' },
];

function buildingPermitConfig(
  permitType: PermitType,
  scope: string,
  extraFields: DocumentFieldDef[],
  requiredExtra: string[],
): DocumentTypeConfig {
  return {
    permitType,
    agencyHeader: OBO_HEADER,
    documentTitle: 'Building Permit',
    documentSubtitle: scope,
    sections: STANDARD_SECTIONS,
    technicalFields: [...COMMON_PROJECT_FIELDS, ...BUILDING_WORKS_FIELDS, ...extraFields],
    requiredForIssuance: [
      'common.floorAreaSqm',
      'common.projectCostCentavos',
      'families.buildingWorks.numberOfStoreys',
      'families.buildingWorks.buildingUseOrOccupancy',
      ...requiredExtra,
    ],
    requiredRelatedApprovals: ['zoningClearanceNo', 'fsecNo'],
    signatoryRole: 'Building Official',
  };
}

const GENERATED_DOCUMENT_CONFIG_ENTRIES: [PermitType, DocumentTypeConfig][] = [
  [
    'Building Permit – New Construction',
    buildingPermitConfig('Building Permit – New Construction', 'NEW CONSTRUCTION', [], []),
  ],
  [
    'Building Permit – Renovation / Alteration',
    buildingPermitConfig(
      'Building Permit – Renovation / Alteration',
      'RENOVATION / ALTERATION',
      [
        { id: 'families.renovation.existingBuildingPermitNo', label: 'Existing Building Permit No.', type: 'text' },
        { id: 'families.renovation.existingCertificateOfOccupancyNo', label: 'Existing Certificate of Occupancy No.', type: 'text' },
        { id: 'families.renovation.existingFloorAreaSqm', label: 'Existing Floor Area', type: 'number', unit: 'sqm' },
        { id: 'families.renovation.areaToBeRenovatedSqm', label: 'Area to be Renovated', type: 'number', unit: 'sqm' },
        { id: 'families.renovation.descriptionOfRenovation', label: 'Description of Renovation', type: 'text' },
        { id: 'families.renovation.changeOfUse', label: 'Change of Use', type: 'boolean' },
        { id: 'families.renovation.previousUse', label: 'Previous Use', type: 'text' },
        { id: 'families.renovation.proposedUse', label: 'Proposed Use', type: 'text' },
        { id: 'families.renovation.estimatedRenovationCostCentavos', label: 'Estimated Renovation Cost', type: 'number', unit: 'PHP' },
      ],
      ['families.renovation.descriptionOfRenovation'],
    ),
  ],
  [
    'Building Permit – Addition / Extension',
    buildingPermitConfig(
      'Building Permit – Addition / Extension',
      'ADDITION / EXTENSION',
      [
        { id: 'families.addition.existingBuildingPermitNo', label: 'Existing Building Permit No.', type: 'text' },
        { id: 'families.addition.additionType', label: 'Type', type: 'select', options: ['Horizontal', 'Vertical', 'Both'] },
        { id: 'families.addition.additionalFloorAreaSqm', label: 'Additional Floor Area', type: 'number', unit: 'sqm' },
        { id: 'families.addition.existingFloorAreaSqm', label: 'Existing Floor Area', type: 'number', unit: 'sqm' },
        { id: 'families.addition.resultingTotalFloorAreaSqm', label: 'Resulting Total Floor Area', type: 'number', unit: 'sqm' },
        { id: 'families.addition.resultingNumberOfStoreys', label: 'Resulting Number of Storeys', type: 'number' },
        { id: 'families.addition.estimatedAdditionCostCentavos', label: 'Estimated Addition Cost', type: 'number', unit: 'PHP' },
      ],
      ['families.addition.additionType', 'families.addition.additionalFloorAreaSqm'],
    ),
  ],
  [
    'Demolition Permit',
    {
      permitType: 'Demolition Permit',
      agencyHeader: OBO_HEADER,
      documentTitle: 'Demolition Permit',
      sections: STANDARD_SECTIONS,
      technicalFields: [
        { id: 'families.demolition.structureNameDescription', label: 'Structure Name / Description', type: 'text' },
        { id: 'families.demolition.existingBuildingPermitNo', label: 'Existing Building Permit No.', type: 'text' },
        { id: 'families.demolition.structureType', label: 'Structure Type', type: 'text' },
        { id: 'families.demolition.numberOfStoreys', label: 'Number of Storeys', type: 'number' },
        { id: 'families.demolition.floorAreaSqm', label: 'Floor Area', type: 'number', unit: 'sqm' },
        { id: 'families.demolition.demolitionScope', label: 'Full / Partial Demolition', type: 'select', options: ['Full', 'Partial'] },
        { id: 'families.demolition.portionToBeDemolished', label: 'Portion to be Demolished', type: 'text' },
        { id: 'families.demolition.demolitionMethod', label: 'Demolition Method', type: 'text' },
        { id: 'families.demolition.proposedStartDate', label: 'Proposed Start Date', type: 'date' },
        { id: 'families.demolition.estimatedCompletionDate', label: 'Estimated Completion Date', type: 'date' },
        { id: 'families.demolition.estimatedDemolitionCostCentavos', label: 'Estimated Demolition Cost', type: 'number', unit: 'PHP' },
        { id: 'families.demolition.demolitionContractor', label: 'Demolition Contractor', type: 'text' },
        { id: 'families.demolition.responsibleEngineer', label: 'Responsible Engineer / Professional', type: 'text' },
        { id: 'families.demolition.responsibleEngineerPrcNo', label: 'PRC No.', type: 'text' },
        { id: 'families.demolition.utilityDisconnectionStatus', label: 'Utility Disconnection Status', type: 'text' },
        { id: 'families.demolition.debrisDisposalMethod', label: 'Debris Disposal Method', type: 'text' },
        { id: 'families.demolition.debrisDisposalLocation', label: 'Debris Disposal Location', type: 'text' },
      ],
      requiredForIssuance: [
        'families.demolition.structureNameDescription',
        'families.demolition.demolitionScope',
        'families.demolition.demolitionMethod',
      ],
      requiredRelatedApprovals: [],
      signatoryRole: 'Building Official',
    },
  ],
  [
    'Zoning / Locational Clearance',
    {
      permitType: 'Zoning / Locational Clearance',
      agencyHeader: ZONING_HEADER,
      documentTitle: 'Zoning / Locational Clearance',
      sections: [
        'officialHeader',
        'permitTitle',
        'permitNumber',
        'applicantOwner',
        'property',
        'technicalSummary',
        'assessment',
        'conditions',
        'approvalSignature',
        'qr',
        'footer',
      ],
      technicalFields: [
        { id: 'families.zoningDecision.existingLandUse', label: 'Existing Land Use', type: 'text' },
        { id: 'families.zoningDecision.proposedLandUse', label: 'Proposed Land Use', type: 'text' },
        { id: 'families.zoningDecision.zoningClassification', label: 'Zoning Classification', type: 'text' },
        { id: 'families.zoningDecision.projectType', label: 'Project Type', type: 'text' },
        { id: 'families.zoningDecision.buildingStructureUse', label: 'Building / Structure Use', type: 'text' },
        { id: 'families.zoningDecision.numberOfStoreys', label: 'Number of Storeys', type: 'number' },
        { id: 'families.zoningDecision.floorAreaSqm', label: 'Floor Area', type: 'number', unit: 'sqm' },
        { id: 'families.zoningDecision.frontSetbackMeters', label: 'Front Setback', type: 'number', unit: 'm' },
        { id: 'families.zoningDecision.rearSetbackMeters', label: 'Rear Setback', type: 'number', unit: 'm' },
        { id: 'families.zoningDecision.leftSetbackMeters', label: 'Left Setback', type: 'number', unit: 'm' },
        { id: 'families.zoningDecision.rightSetbackMeters', label: 'Right Setback', type: 'number', unit: 'm' },
        { id: 'families.zoningDecision.roadClassification', label: 'Road Classification', type: 'text' },
        { id: 'families.zoningDecision.requiredParkingSpaces', label: 'Required Parking Spaces', type: 'number' },
        { id: 'families.zoningDecision.providedParkingSpaces', label: 'Provided Parking Spaces', type: 'number' },
        { id: 'families.zoningDecision.easementInformation', label: 'Easement Information', type: 'text' },
        { id: 'families.zoningDecision.zoningFinding', label: 'Zoning Finding', type: 'text' },
        {
          id: 'families.zoningDecision.decision',
          label: 'Decision',
          type: 'select',
          options: ['Conforming', 'Approved with Conditions', 'Variance / Exception', 'Denied', 'Pending'],
        },
        { id: 'families.zoningDecision.varianceReference', label: 'Variance / Exception Reference', type: 'text' },
      ],
      requiredForIssuance: ['families.zoningDecision.zoningClassification', 'families.zoningDecision.decision'],
      requiredRelatedApprovals: [],
      signatoryRole: 'Zoning Administrator',
    },
  ],
  [
    'Architectural Permit',
    {
      permitType: 'Architectural Permit',
      agencyHeader: OBO_HEADER,
      documentTitle: 'Architectural Permit',
      sections: STANDARD_SECTIONS,
      technicalFields: [
        { id: 'families.architectural.lotAreaSqm', label: 'Lot Area', type: 'number', unit: 'sqm' },
        { id: 'families.architectural.buildingFootprintSqm', label: 'Building Footprint', type: 'number', unit: 'sqm' },
        { id: 'families.architectural.numberOfStoreys', label: 'Number of Storeys', type: 'number' },
        { id: 'families.architectural.buildingHeightMeters', label: 'Building Height', type: 'number', unit: 'm' },
        { id: 'families.architectural.totalFloorAreaSqm', label: 'Total Floor Area', type: 'number', unit: 'sqm' },
        { id: 'families.architectural.percentageOfSiteOccupancy', label: 'Percentage of Site Occupancy', type: 'number', unit: '%' },
        { id: 'families.architectural.totalOpenSpaceSqm', label: 'Total Open Space', type: 'number', unit: 'sqm' },
        { id: 'families.architectural.numberOfParkingSpaces', label: 'Number of Parking Spaces', type: 'number' },
        { id: 'families.architectural.accessibilityProvisions', label: 'Accessibility Provisions', type: 'text' },
        { id: 'families.architectural.scopeOfWork', label: 'Architectural Scope of Work', type: 'text' },
        { id: 'families.architectural.approvedPlanRevision', label: 'Approved Architectural Plan Revision', type: 'text' },
        { id: 'families.architectural.approvedDrawingReferences', label: 'Approved Drawing / Sheet References', type: 'text' },
      ],
      requiredForIssuance: ['families.architectural.totalFloorAreaSqm', 'families.architectural.scopeOfWork'],
      requiredRelatedApprovals: ['buildingPermitNo'],
      signatoryRole: 'Building Official',
    },
  ],
  [
    'Civil / Structural Permit',
    {
      permitType: 'Civil / Structural Permit',
      agencyHeader: OBO_HEADER,
      documentTitle: 'Civil / Structural Permit',
      sections: STANDARD_SECTIONS,
      technicalFields: [
        { id: 'families.structural.structuralSystem', label: 'Structural System', type: 'text' },
        { id: 'families.structural.foundationType', label: 'Foundation Type', type: 'text' },
        { id: 'families.structural.foundationDepthMeters', label: 'Foundation Depth', type: 'number', unit: 'm' },
        { id: 'families.structural.soilBearingCapacity', label: 'Soil Bearing Capacity', type: 'text' },
        { id: 'families.structural.concreteStrength', label: 'Concrete Strength', type: 'text' },
        { id: 'families.structural.reinforcingSteelGrade', label: 'Reinforcing Steel Grade', type: 'text' },
        { id: 'families.structural.designLiveLoad', label: 'Design Live Load', type: 'text' },
        { id: 'families.structural.designDeadLoad', label: 'Design Dead Load', type: 'text' },
        { id: 'families.structural.windDesignParameters', label: 'Wind Design Parameters', type: 'text' },
        { id: 'families.structural.seismicDesignParameters', label: 'Seismic Design Parameters', type: 'text' },
        { id: 'families.structural.basementLevels', label: 'Basement Levels', type: 'number' },
        { id: 'families.structural.structuralAnalysisReference', label: 'Structural Analysis Reference', type: 'text' },
        { id: 'families.structural.geotechnicalReportReference', label: 'Geotechnical Report Reference', type: 'text' },
        { id: 'families.structural.approvedStructuralPlanRevision', label: 'Approved Structural Plan Revision', type: 'text' },
      ],
      requiredForIssuance: ['families.structural.structuralSystem', 'families.structural.foundationType'],
      requiredRelatedApprovals: ['buildingPermitNo'],
      signatoryRole: 'Building Official',
    },
  ],
  [
    'Electrical Permit',
    {
      permitType: 'Electrical Permit',
      agencyHeader: OBO_HEADER,
      documentTitle: 'Electrical Permit',
      sections: EQUIPMENT_SECTIONS,
      technicalFields: [
        { id: 'families.electrical.typeOfElectricalWork', label: 'Type of Electrical Work', type: 'text' },
        { id: 'families.electrical.serviceVoltage', label: 'Service Voltage', type: 'text' },
        { id: 'families.electrical.numberOfPhases', label: 'Number of Phases', type: 'number' },
        { id: 'families.electrical.numberOfServiceConnections', label: 'Number of Service Connections', type: 'number' },
        { id: 'families.electrical.totalConnectedLoadKva', label: 'Total Connected Load', type: 'number', unit: 'kVA' },
        { id: 'families.electrical.computedDemandLoadKva', label: 'Computed Demand Load', type: 'number', unit: 'kVA' },
        { id: 'families.electrical.transformerCapacityKva', label: 'Transformer Capacity', type: 'number', unit: 'kVA' },
        { id: 'families.electrical.generatorCapacityKva', label: 'Generator Capacity', type: 'number', unit: 'kVA' },
        { id: 'families.electrical.solarPvCapacityKw', label: 'Solar / PV Capacity', type: 'number', unit: 'kW' },
        { id: 'families.electrical.numberOfPanels', label: 'Number of Panels', type: 'number' },
        { id: 'families.electrical.numberOfCircuits', label: 'Number of Circuits', type: 'number' },
        { id: 'families.electrical.groundingSystem', label: 'Grounding System', type: 'text' },
      ],
      equipmentTable: {
        family: 'electrical',
        arrayFieldId: 'families.electrical.equipment',
        title: 'Electrical Equipment Schedule',
        columns: [
          { key: 'description', label: 'Equipment Description' },
          { key: 'quantity', label: 'Qty' },
          { key: 'rating', label: 'Rating' },
          { key: 'location', label: 'Floor / Location' },
          { key: 'newExistingRelocated', label: 'New / Existing / Relocated' },
        ],
      },
      requiredForIssuance: ['families.electrical.totalConnectedLoadKva'],
      requiredRelatedApprovals: [],
      signatoryRole: 'Building Official',
    },
  ],
  [
    'Mechanical Permit',
    {
      permitType: 'Mechanical Permit',
      agencyHeader: OBO_HEADER,
      documentTitle: 'Mechanical Permit',
      sections: EQUIPMENT_SECTIONS,
      technicalFields: [
        { id: 'families.mechanical.totalMechanicalCapacity', label: 'Total Mechanical Capacity', type: 'text' },
        { id: 'families.mechanical.ventilationCapacity', label: 'Ventilation Capacity', type: 'text' },
        { id: 'families.mechanical.mechanicalRoomLocation', label: 'Mechanical Room / Equipment Location', type: 'text' },
        { id: 'families.mechanical.estimatedMechanicalCostCentavos', label: 'Estimated Mechanical Cost', type: 'number', unit: 'PHP' },
      ],
      equipmentTable: {
        family: 'mechanical',
        arrayFieldId: 'families.mechanical.equipment',
        title: 'Mechanical Equipment Schedule',
        columns: [
          { key: 'description', label: 'Description' },
          { key: 'quantity', label: 'Qty' },
          { key: 'rating', label: 'Capacity / HP / kW / TR' },
          { key: 'location', label: 'Floor / Location' },
          { key: 'newExistingRelocated', label: 'New / Existing / Relocated' },
        ],
      },
      requiredForIssuance: [],
      requiredRelatedApprovals: [],
      signatoryRole: 'Building Official',
    },
  ],
  [
    'Sanitary Permit',
    {
      permitType: 'Sanitary Permit',
      agencyHeader: OBO_HEADER,
      documentTitle: 'Sanitary Permit',
      sections: STANDARD_SECTIONS,
      technicalFields: [
        { id: 'families.sanitary.waterSupplySource', label: 'Water Supply Source', type: 'text' },
        { id: 'families.sanitary.waterStorageCapacityLiters', label: 'Water Storage Capacity', type: 'number', unit: 'L' },
        { id: 'families.sanitary.wastewaterDisposalMethod', label: 'Wastewater Disposal Method', type: 'text' },
        { id: 'families.sanitary.publicSewerConnection', label: 'Public Sewer Connection', type: 'boolean' },
        { id: 'families.sanitary.septicTank', label: 'Septic Tank', type: 'boolean' },
        { id: 'families.sanitary.septicTankType', label: 'Septic Tank Type', type: 'text' },
        { id: 'families.sanitary.septicTankCapacityLiters', label: 'Septic Tank Capacity', type: 'number', unit: 'L' },
        { id: 'families.sanitary.numberOfSepticChambers', label: 'Number of Septic Chambers', type: 'number' },
        { id: 'families.sanitary.sewageTreatmentSystem', label: 'Sewage Treatment System', type: 'text' },
        { id: 'families.sanitary.greaseTrapInterceptor', label: 'Grease Trap / Interceptor', type: 'boolean' },
        { id: 'families.sanitary.stormDrainageSystem', label: 'Storm Drainage System', type: 'text' },
        { id: 'families.sanitary.populationDesignCapacity', label: 'Population / User Design Capacity', type: 'number' },
        { id: 'families.sanitary.estimatedSanitaryCostCentavos', label: 'Estimated Sanitary Work Cost', type: 'number', unit: 'PHP' },
      ],
      requiredForIssuance: ['families.sanitary.wastewaterDisposalMethod'],
      requiredRelatedApprovals: [],
      signatoryRole: 'Building Official',
    },
  ],
  [
    'Plumbing Permit',
    {
      permitType: 'Plumbing Permit',
      agencyHeader: OBO_HEADER,
      documentTitle: 'Plumbing Permit',
      sections: EQUIPMENT_SECTIONS,
      technicalFields: [
        { id: 'families.plumbing.waterServiceConnection', label: 'Water Service Connection', type: 'text' },
        { id: 'families.plumbing.mainPipeSize', label: 'Main Pipe Size', type: 'text' },
        { id: 'families.plumbing.waterPipeMaterial', label: 'Water Pipe Material', type: 'text' },
        { id: 'families.plumbing.drainagePipeMaterial', label: 'Drainage Pipe Material', type: 'text' },
        { id: 'families.plumbing.sewerConnection', label: 'Sewer Connection', type: 'text' },
        { id: 'families.plumbing.septicConnection', label: 'Septic Connection', type: 'text' },
        { id: 'families.plumbing.ventSystem', label: 'Vent System', type: 'text' },
        { id: 'families.plumbing.waterTankCapacityLiters', label: 'Water Tank Capacity', type: 'number', unit: 'L' },
        { id: 'families.plumbing.waterPumpCapacity', label: 'Water Pump Capacity', type: 'text' },
        { id: 'families.plumbing.hotWaterSystem', label: 'Hot Water System', type: 'text' },
      ],
      equipmentTable: {
        family: 'plumbing',
        arrayFieldId: 'families.plumbing.fixtures',
        title: 'Fixture Schedule',
        columns: [
          { key: 'description', label: 'Fixture Type' },
          { key: 'quantity', label: 'Final Quantity' },
          { key: 'newExistingRelocated', label: 'New / Existing / Relocated' },
          { key: 'remarks', label: 'Remarks' },
        ],
      },
      requiredForIssuance: [],
      requiredRelatedApprovals: [],
      signatoryRole: 'Building Official',
    },
  ],
  [
    'Electronics Permit',
    {
      permitType: 'Electronics Permit',
      agencyHeader: OBO_HEADER,
      documentTitle: 'Electronics Permit',
      sections: EQUIPMENT_SECTIONS,
      technicalFields: [],
      equipmentTable: {
        family: 'electronics',
        arrayFieldId: 'families.electronics.systems',
        title: 'Electronics Systems Schedule',
        columns: [
          { key: 'description', label: 'System Type / Description' },
          { key: 'quantity', label: 'Devices / Ports' },
          { key: 'rating', label: 'Capacity' },
          { key: 'location', label: 'Floor / Location' },
          { key: 'newExistingRelocated', label: 'New / Existing / Relocated' },
        ],
      },
      requiredForIssuance: [],
      requiredRelatedApprovals: [],
      signatoryRole: 'Building Official',
    },
  ],
  [
    'Interior Design Permit',
    {
      permitType: 'Interior Design Permit',
      agencyHeader: OBO_HEADER,
      documentTitle: 'Interior Design Permit',
      sections: STANDARD_SECTIONS,
      technicalFields: [
        { id: 'families.interiorDesign.floorLevel', label: 'Floor / Level', type: 'text' },
        { id: 'families.interiorDesign.existingUse', label: 'Existing Use', type: 'text' },
        { id: 'families.interiorDesign.proposedUse', label: 'Proposed Use', type: 'text' },
        { id: 'families.interiorDesign.totalInteriorAreaSqm', label: 'Total Interior Area', type: 'number', unit: 'sqm' },
        { id: 'families.interiorDesign.roomsAreasAffected', label: 'Rooms / Areas Affected', type: 'text' },
        { id: 'families.interiorDesign.typeOfWork', label: 'Type of Work', type: 'text' },
        { id: 'families.interiorDesign.wallFinish', label: 'Wall Finish', type: 'text' },
        { id: 'families.interiorDesign.ceilingFinish', label: 'Ceiling Finish', type: 'text' },
        { id: 'families.interiorDesign.hvacCoordination', label: 'HVAC Coordination', type: 'text' },
        { id: 'families.interiorDesign.electricalCoordination', label: 'Electrical Coordination', type: 'text' },
        { id: 'families.interiorDesign.fireProtectionCoordination', label: 'Fire Protection Coordination', type: 'text' },
        { id: 'families.interiorDesign.estimatedInteriorCostCentavos', label: 'Estimated Interior Cost', type: 'number', unit: 'PHP' },
      ],
      requiredForIssuance: ['families.interiorDesign.totalInteriorAreaSqm', 'families.interiorDesign.typeOfWork'],
      requiredRelatedApprovals: [],
      signatoryRole: 'Building Official',
    },
  ],
  [
    'Fencing Permit',
    {
      permitType: 'Fencing Permit',
      agencyHeader: OBO_HEADER,
      documentTitle: 'Fencing Permit',
      sections: STANDARD_SECTIONS,
      technicalFields: [
        { id: 'families.fencing.typeOfWork', label: 'Type of Work', type: 'text' },
        { id: 'families.fencing.fenceType', label: 'Fence Type', type: 'text' },
        { id: 'families.fencing.material', label: 'Material', type: 'text' },
        { id: 'families.fencing.totalLengthMeters', label: 'Total Length', type: 'number', unit: 'm' },
        { id: 'families.fencing.frontLengthMeters', label: 'Front Length', type: 'number', unit: 'm' },
        { id: 'families.fencing.rearLengthMeters', label: 'Rear Length', type: 'number', unit: 'm' },
        { id: 'families.fencing.leftSideLengthMeters', label: 'Left-Side Length', type: 'number', unit: 'm' },
        { id: 'families.fencing.rightSideLengthMeters', label: 'Right-Side Length', type: 'number', unit: 'm' },
        { id: 'families.fencing.averageHeightMeters', label: 'Average Height', type: 'number', unit: 'm' },
        { id: 'families.fencing.maximumHeightMeters', label: 'Maximum Height', type: 'number', unit: 'm' },
        { id: 'families.fencing.foundationType', label: 'Foundation Type', type: 'text' },
        { id: 'families.fencing.numberOfGates', label: 'Number of Gates', type: 'number' },
        { id: 'families.fencing.gateWidthMeters', label: 'Gate Width', type: 'number', unit: 'm' },
        { id: 'families.fencing.estimatedCostCentavos', label: 'Estimated Cost', type: 'number', unit: 'PHP' },
      ],
      requiredForIssuance: ['families.fencing.totalLengthMeters', 'families.fencing.maximumHeightMeters'],
      requiredRelatedApprovals: [],
      signatoryRole: 'Building Official',
    },
  ],
  [
    'Sign Permit',
    {
      permitType: 'Sign Permit',
      agencyHeader: OBO_HEADER,
      documentTitle: 'Sign Permit',
      sections: STANDARD_SECTIONS,
      technicalFields: [
        { id: 'families.sign.signType', label: 'Sign Type', type: 'text' },
        { id: 'families.sign.signWording', label: 'Sign Wording / Message', type: 'text' },
        { id: 'families.sign.numberOfSigns', label: 'Number of Signs', type: 'number' },
        { id: 'families.sign.widthMeters', label: 'Width', type: 'number', unit: 'm' },
        { id: 'families.sign.heightMeters', label: 'Height', type: 'number', unit: 'm' },
        { id: 'families.sign.totalSignAreaSqm', label: 'Total Sign Area', type: 'number', unit: 'sqm' },
        { id: 'families.sign.overallHeightAboveGroundMeters', label: 'Overall Height Above Ground', type: 'number', unit: 'm' },
        { id: 'families.sign.clearanceAboveGradeMeters', label: 'Clearance Above Grade', type: 'number', unit: 'm' },
        { id: 'families.sign.numberOfFaces', label: 'Number of Faces', type: 'number' },
        { id: 'families.sign.illuminationType', label: 'Illumination Type', type: 'text' },
        { id: 'families.sign.electricalLoadKva', label: 'Electrical Load', type: 'number', unit: 'kVA' },
        { id: 'families.sign.constructionMaterial', label: 'Construction Material', type: 'text' },
        { id: 'families.sign.supportStructure', label: 'Support Structure', type: 'text' },
        { id: 'families.sign.mountingMethod', label: 'Mounting Method', type: 'text' },
        { id: 'families.sign.exactPlacement', label: 'Exact Placement', type: 'text' },
        { id: 'families.sign.setbackFromPropertyLineMeters', label: 'Setback From Property Line', type: 'number', unit: 'm' },
        { id: 'families.sign.distanceFromRoadMeters', label: 'Distance From Road', type: 'number', unit: 'm' },
        { id: 'families.sign.estimatedCostCentavos', label: 'Estimated Cost', type: 'number', unit: 'PHP' },
      ],
      requiredForIssuance: ['families.sign.totalSignAreaSqm', 'families.sign.exactPlacement'],
      requiredRelatedApprovals: [],
      signatoryRole: 'Building Official',
    },
  ],
  [
    'Excavation Permit',
    {
      permitType: 'Excavation Permit',
      agencyHeader: OBO_HEADER,
      documentTitle: 'Excavation Permit',
      sections: STANDARD_SECTIONS,
      technicalFields: [
        { id: 'families.excavation.purposeOfExcavation', label: 'Purpose of Excavation', type: 'text' },
        { id: 'families.excavation.excavationType', label: 'Excavation Type', type: 'text' },
        { id: 'families.excavation.lengthMeters', label: 'Length', type: 'number', unit: 'm' },
        { id: 'families.excavation.widthMeters', label: 'Width', type: 'number', unit: 'm' },
        { id: 'families.excavation.areaSqm', label: 'Area', type: 'number', unit: 'sqm' },
        { id: 'families.excavation.maximumDepthMeters', label: 'Maximum Depth', type: 'number', unit: 'm' },
        { id: 'families.excavation.estimatedVolumeCubicMeters', label: 'Estimated Excavation Volume', type: 'number', unit: 'cu.m' },
        { id: 'families.excavation.numberOfBasementLevels', label: 'Number of Basement Levels', type: 'number' },
        { id: 'families.excavation.soilClassification', label: 'Soil Classification', type: 'text' },
        { id: 'families.excavation.groundwaterCondition', label: 'Groundwater Condition', type: 'text' },
        { id: 'families.excavation.shoringMethod', label: 'Shoring Method', type: 'text' },
        { id: 'families.excavation.retainingSystem', label: 'Retaining System', type: 'text' },
        { id: 'families.excavation.dewateringMethod', label: 'Dewatering Method', type: 'text' },
        { id: 'families.excavation.proposedStartDate', label: 'Proposed Start Date', type: 'date' },
        { id: 'families.excavation.proposedCompletionDate', label: 'Proposed Completion Date', type: 'date' },
        { id: 'families.excavation.excavatedMaterialDisposalSite', label: 'Excavated Material Disposal Site', type: 'text' },
        { id: 'families.excavation.safetyBarricades', label: 'Safety Barricades', type: 'boolean' },
        { id: 'families.excavation.constructionSafetyOfficer', label: 'Construction Safety Officer', type: 'text' },
      ],
      requiredForIssuance: ['families.excavation.maximumDepthMeters', 'families.excavation.estimatedVolumeCubicMeters'],
      requiredRelatedApprovals: [],
      signatoryRole: 'Building Official',
    },
  ],
  [
    'FSEC for Building Permit (BFP)',
    {
      permitType: 'FSEC for Building Permit (BFP)',
      agencyHeader: BFP_HEADER,
      documentTitle: 'Fire Safety Evaluation Clearance',
      sections: BFP_SECTIONS,
      technicalFields: [
        { id: 'common.floorAreaSqm', label: 'Floor Area', type: 'number', unit: 'sqm' },
        { id: 'families.buildingWorks.numberOfStoreys', label: 'Number of Storeys', type: 'number' },
        { id: 'families.fireSafety.natureOfProject', label: 'Nature of Project', type: 'text' },
        { id: 'families.fireSafety.approvedArchitecturalPlanRef', label: 'Architectural Plan Reference', type: 'text' },
        { id: 'families.fireSafety.approvedStructuralPlanRef', label: 'Structural Plan Reference', type: 'text' },
        { id: 'families.fireSafety.approvedElectricalPlanRef', label: 'Electrical Plan Reference', type: 'text' },
        { id: 'families.fireSafety.approvedMechanicalPlanRef', label: 'Mechanical Plan Reference', type: 'text' },
        { id: 'families.fireSafety.approvedSanitaryPlumbingPlanRef', label: 'Sanitary / Plumbing Plan Reference', type: 'text' },
        { id: 'families.fireSafety.approvedFireProtectionPlanRef', label: 'Fire Protection Plan Reference', type: 'text' },
        {
          id: 'families.fireSafety.evaluationOrInspectionResult',
          label: 'Evaluation Result',
          type: 'select',
          options: ['Approved', 'Approved with Conditions', 'Disapproved', 'Pending'],
        },
        { id: 'families.fireSafety.fireMarshalRemarks', label: 'Conditions / Remarks', type: 'text' },
      ],
      requiredForIssuance: ['families.fireSafety.evaluationOrInspectionResult'],
      requiredRelatedApprovals: [],
      signatoryRole: 'Fire Marshal',
    },
  ],
  [
    'Certificate of Occupancy',
    {
      permitType: 'Certificate of Occupancy',
      agencyHeader: OBO_HEADER,
      documentTitle: 'Certificate of Occupancy',
      sections: STANDARD_SECTIONS,
      technicalFields: [
        { id: 'common.floorAreaSqm', label: 'Total Floor Area', type: 'number', unit: 'sqm' },
        { id: 'families.buildingWorks.numberOfStoreys', label: 'Number of Storeys', type: 'number' },
        { id: 'families.buildingWorks.buildingHeightMeters', label: 'Building Height', type: 'number', unit: 'm' },
        { id: 'families.occupancy.certificateType', label: 'Full / Partial Occupancy', type: 'select', options: ['Full', 'Partial'] },
        { id: 'families.occupancy.floorsAreasAuthorized', label: 'Floor / Areas Authorized', type: 'text' },
        { id: 'families.occupancy.areaAuthorizedSqm', label: 'Area Authorized', type: 'number', unit: 'sqm' },
        { id: 'families.occupancy.areasExcluded', label: 'Areas Excluded', type: 'text' },
        { id: 'families.occupancy.approvedUse', label: 'Approved Use', type: 'text' },
        { id: 'families.occupancy.occupancyClassification', label: 'Occupancy Classification', type: 'text' },
        { id: 'families.occupancy.areaApprovedForOccupancySqm', label: 'Area Approved for Occupancy', type: 'number', unit: 'sqm' },
        { id: 'families.occupancy.completionDate', label: 'Completion Date', type: 'date' },
        { id: 'families.occupancy.finalInspectionDate', label: 'Final Inspection Date', type: 'date' },
        { id: 'families.occupancy.finalInspectionResult', label: 'Final Inspection Result', type: 'text' },
        { id: 'families.occupancy.certificateOfCompletionRef', label: 'Certificate of Completion Reference', type: 'text' },
        { id: 'families.occupancy.asBuiltPlanRevision', label: 'As-Built Plan Revision', type: 'text' },
      ],
      requiredForIssuance: [
        'families.occupancy.certificateType',
        'families.occupancy.approvedUse',
        'families.occupancy.finalInspectionResult',
      ],
      requiredRelatedApprovals: ['buildingPermitNo', 'fsicNo'],
      signatoryRole: 'Building Official',
    },
  ],
  [
    'FSIC for Occupancy Permit (BFP)',
    {
      permitType: 'FSIC for Occupancy Permit (BFP)',
      agencyHeader: BFP_HEADER,
      documentTitle: 'Fire Safety Inspection Certificate',
      documentSubtitle: 'FOR OCCUPANCY',
      sections: BFP_SECTIONS,
      technicalFields: [
        { id: 'families.fireSafety.inspectionDate', label: 'Inspection Date', type: 'date' },
        { id: 'families.fireSafety.fireSafetyInspector', label: 'Fire Safety Inspector', type: 'text' },
        { id: 'families.fireSafety.reinspectionDate', label: 'Reinspection Date', type: 'date' },
        {
          id: 'families.fireSafety.evaluationOrInspectionResult',
          label: 'Compliance Result',
          type: 'select',
          options: ['Approved', 'Approved with Conditions', 'Disapproved', 'Pending'],
        },
        { id: 'families.fireSafety.fireMarshalRemarks', label: 'Conditions / Remarks', type: 'text' },
      ],
      requiredForIssuance: [
        'families.fireSafety.inspectionDate',
        'families.fireSafety.fireSafetyInspector',
        'families.fireSafety.evaluationOrInspectionResult',
      ],
      requiredRelatedApprovals: ['buildingPermitNo', 'fsecNo'],
      signatoryRole: 'Fire Marshal',
    },
  ],
];

export const GENERATED_DOCUMENT_CONFIG: Record<PermitType, DocumentTypeConfig> = Object.fromEntries(
  GENERATED_DOCUMENT_CONFIG_ENTRIES,
) as Record<PermitType, DocumentTypeConfig>;

/** Runtime completeness guard, mirrored by generated-document.config.spec.ts — every ALL_PERMIT_TYPES entry must have a config, no more, no less. */
export function assertGeneratedDocumentConfigComplete(): void {
  for (const type of ALL_PERMIT_TYPES) {
    if (!GENERATED_DOCUMENT_CONFIG[type]) {
      throw new Error(`generated-document.config.ts is missing a DocumentTypeConfig for "${type}"`);
    }
  }
}

export function configFor(permitType: PermitType): DocumentTypeConfig {
  return GENERATED_DOCUMENT_CONFIG[permitType];
}
