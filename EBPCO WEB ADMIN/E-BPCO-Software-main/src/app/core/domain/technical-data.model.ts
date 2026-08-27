// Canonical, staff-verified technical facts about an application's project
// — the data the generated permit documents actually print. Kept
// deliberately separate from AssessmentLineItem.inputs (assessment.model.ts):
// that field is an immutable per-fee-line snapshot, versioned so a later
// correction never rewrites an already-issued fee; this record instead
// always reflects the LATEST reviewer-verified value, because the printed
// document must show the corrected figure (e.g. floor area corrected from
// 200 sqm to 192.40 sqm), never the original applicant-submitted one. The
// two are intentionally not synced in this pass.
//
// Shape: one common block every permit type reads from, plus a `families`
// bag of named, fully-optional sub-objects — several families are shared
// across more than one PermitType (e.g. `fireSafety` backs both FSEC and
// FSIC), so this is ~13 real shapes, not 19 bespoke ones. Which family
// block(s) a given PermitType actually uses is decided entirely by
// generated-document.config.ts, never inferred here from which fields
// happen to be filled in.
export type TechnicalDataStatus = 'Draft' | 'Verified';

export interface Professional {
  id: string;
  role: string;
  fullName: string;
  prcNumber: string | null;
  prcExpiry: string | null;
  ptrNumber: string | null;
  ptrIssuedAt: string | null;
  tin: string | null;
}

export interface LotIdentifiers {
  octTctNumber: string | null;
  taxDeclarationNumber: string | null;
  surveyPlanNumber: string | null;
  lotAreaSqm: number | null;
}

/** Manually-entered cross-references to OTHER permits/clearances this application depends on (e.g. a Building Permit's Zoning Clearance No.). Staff types these in as they become known from other processes — never auto-linked/synced to another application record. */
export interface RelatedApprovalReferences {
  zoningClearanceNo: string | null;
  zoningClearanceDate: string | null;
  fsecNo: string | null;
  fsecDate: string | null;
  architecturalPermitNo: string | null;
  structuralPermitNo: string | null;
  electricalPermitNo: string | null;
  mechanicalPermitNo: string | null;
  sanitaryPermitNo: string | null;
  plumbingPermitNo: string | null;
  electronicsPermitNo: string | null;
  interiorDesignPermitNo: string | null;
  buildingPermitNo: string | null;
  buildingPermitDate: string | null;
  certificateOfOccupancyNo: string | null;
  fsicNo: string | null;
  occupancyApplicationNo: string | null;
}

export function emptyRelatedApprovals(): RelatedApprovalReferences {
  return {
    zoningClearanceNo: null,
    zoningClearanceDate: null,
    fsecNo: null,
    fsecDate: null,
    architecturalPermitNo: null,
    structuralPermitNo: null,
    electricalPermitNo: null,
    mechanicalPermitNo: null,
    sanitaryPermitNo: null,
    plumbingPermitNo: null,
    electronicsPermitNo: null,
    interiorDesignPermitNo: null,
    buildingPermitNo: null,
    buildingPermitDate: null,
    certificateOfOccupancyNo: null,
    fsicNo: null,
    occupancyApplicationNo: null,
  };
}

export interface CommonTechnicalData {
  ownerTin: string | null;
  applicantNameOverride: string | null;
  contractor: string | null;
  pcabLicenseNo: string | null;
  lot: LotIdentifiers;
  floorAreaSqm: number | null;
  buildingFootprintSqm: number | null;
  projectCostCentavos: number | null;
  scopeOfWorkDescription: string | null;
  professionals: Professional[];
  relatedApprovals: RelatedApprovalReferences;
}

export function emptyCommonTechnicalData(): CommonTechnicalData {
  return {
    ownerTin: null,
    applicantNameOverride: null,
    contractor: null,
    pcabLicenseNo: null,
    lot: { octTctNumber: null, taxDeclarationNumber: null, surveyPlanNumber: null, lotAreaSqm: null },
    floorAreaSqm: null,
    buildingFootprintSqm: null,
    projectCostCentavos: null,
    scopeOfWorkDescription: null,
    professionals: [],
    relatedApprovals: emptyRelatedApprovals(),
  };
}

export interface EquipmentRow {
  id: string;
  description: string;
  quantity: number | null;
  unit: string | null;
  rating: string | null;
  location: string | null;
  newExistingRelocated: 'New' | 'Existing' | 'Relocated' | null;
  remarks: string | null;
}

export interface BuildingWorksData {
  numberOfStoreys: number | null;
  buildingHeightMeters: number | null;
  buildingUseOrOccupancy: string | null;
  occupancyClassification: string | null;
  typeOfConstruction: string | null;
}

export interface RenovationData {
  existingBuildingPermitNo: string | null;
  existingCertificateOfOccupancyNo: string | null;
  existingBuildingUse: string | null;
  existingOccupancyClassification: string | null;
  existingNumberOfStoreys: number | null;
  existingFloorAreaSqm: number | null;
  areaToBeRenovatedSqm: number | null;
  floorLevelAffected: string | null;
  roomsAreasAffected: string | null;
  descriptionOfRenovation: string | null;
  structuralAlteration: boolean | null;
  architecturalAlteration: boolean | null;
  electricalAlteration: boolean | null;
  mechanicalAlteration: boolean | null;
  plumbingAlteration: boolean | null;
  sanitaryAlteration: boolean | null;
  electronicsAlteration: boolean | null;
  changeOfUse: boolean | null;
  previousUse: string | null;
  proposedUse: string | null;
  estimatedRenovationCostCentavos: number | null;
}

export interface AdditionData {
  existingBuildingPermitNo: string | null;
  existingCertificateOfOccupancyNo: string | null;
  existingUse: string | null;
  existingNumberOfStoreys: number | null;
  existingFloorAreaSqm: number | null;
  additionType: 'Horizontal' | 'Vertical' | 'Both' | null;
  additionalFloorAreaSqm: number | null;
  resultingTotalFloorAreaSqm: number | null;
  additionalStoreys: number | null;
  resultingNumberOfStoreys: number | null;
  extensionLocation: string | null;
  additionalBuildingFootprintSqm: number | null;
  resultingBuildingHeightMeters: number | null;
  estimatedAdditionCostCentavos: number | null;
}

export interface DemolitionData {
  structureNameDescription: string | null;
  existingBuildingPermitNo: string | null;
  existingCertificateOfOccupancyNo: string | null;
  existingUse: string | null;
  structureType: string | null;
  numberOfStoreys: number | null;
  floorAreaSqm: number | null;
  buildingHeightMeters: number | null;
  mainConstructionMaterials: string | null;
  demolitionScope: 'Full' | 'Partial' | null;
  portionToBeDemolished: string | null;
  demolitionMethod: string | null;
  proposedStartDate: string | null;
  estimatedCompletionDate: string | null;
  estimatedDemolitionCostCentavos: number | null;
  demolitionContractor: string | null;
  responsibleEngineer: string | null;
  responsibleEngineerPrcNo: string | null;
  utilityDisconnectionStatus: string | null;
  temporaryFenceBarricade: boolean | null;
  adjacentStructureProtection: string | null;
  pedestrianProtection: string | null;
  dustControl: string | null;
  debrisDisposalMethod: string | null;
  debrisDisposalLocation: string | null;
}

export interface ZoningDecisionData {
  existingLandUse: string | null;
  proposedLandUse: string | null;
  zoningClassification: string | null;
  projectType: string | null;
  buildingStructureUse: string | null;
  numberOfStoreys: number | null;
  floorAreaSqm: number | null;
  buildingHeightMeters: number | null;
  frontSetbackMeters: number | null;
  rearSetbackMeters: number | null;
  leftSetbackMeters: number | null;
  rightSetbackMeters: number | null;
  roadClassification: string | null;
  parkingRequirement: string | null;
  requiredParkingSpaces: number | null;
  providedParkingSpaces: number | null;
  easementInformation: string | null;
  zoningFinding: string | null;
  decision: 'Conforming' | 'Approved with Conditions' | 'Variance / Exception' | 'Denied' | 'Pending' | null;
  varianceReference: string | null;
  zoningAdministrator: string | null;
}

export interface ArchitecturalData {
  lotAreaSqm: number | null;
  buildingFootprintSqm: number | null;
  numberOfStoreys: number | null;
  buildingHeightMeters: number | null;
  groundFloorAreaSqm: number | null;
  secondFloorAreaSqm: number | null;
  otherFloorAreasSqm: number | null;
  totalFloorAreaSqm: number | null;
  percentageOfSiteOccupancy: number | null;
  totalOpenSpaceSqm: number | null;
  frontSetbackMeters: number | null;
  rearSetbackMeters: number | null;
  leftSetbackMeters: number | null;
  rightSetbackMeters: number | null;
  numberOfParkingSpaces: number | null;
  numberOfRoomsMajorSpaces: number | null;
  accessibilityProvisions: string | null;
  scopeOfWork: string | null;
  approvedPlanRevision: string | null;
  approvedDrawingReferences: string | null;
}

export interface StructuralData {
  structuralSystem: string | null;
  foundationType: string | null;
  foundationDepthMeters: number | null;
  soilBearingCapacity: string | null;
  concreteStrength: string | null;
  reinforcingSteelGrade: string | null;
  structuralSteelGrade: string | null;
  designLiveLoad: string | null;
  designDeadLoad: string | null;
  windDesignParameters: string | null;
  seismicDesignParameters: string | null;
  basementLevels: number | null;
  retainingWalls: string | null;
  specialStructuralComponents: string | null;
  structuralAnalysisReference: string | null;
  geotechnicalReportReference: string | null;
  approvedStructuralPlanRevision: string | null;
}

export interface ElectricalData {
  typeOfElectricalWork: string | null;
  serviceVoltage: string | null;
  numberOfPhases: number | null;
  frequencyHz: number | null;
  numberOfServiceConnections: number | null;
  totalConnectedLoadKva: number | null;
  computedDemandLoadKva: number | null;
  transformerCapacityKva: number | null;
  generatorCapacityKva: number | null;
  solarPvCapacityKw: number | null;
  batteryCapacityKwh: number | null;
  numberOfPanels: number | null;
  numberOfCircuits: number | null;
  lightingLoadKva: number | null;
  outletLoadKva: number | null;
  motorLoadKva: number | null;
  equipmentLoadKva: number | null;
  groundingSystem: string | null;
  equipment: EquipmentRow[];
}

export interface MechanicalData {
  mechanicalRoomLocation: string | null;
  totalMechanicalCapacity: string | null;
  ventilationCapacity: string | null;
  estimatedMechanicalCostCentavos: number | null;
  equipment: EquipmentRow[];
}

export interface SanitaryData {
  waterSupplySource: string | null;
  waterStorageCapacityLiters: number | null;
  wastewaterDisposalMethod: string | null;
  publicSewerConnection: boolean | null;
  septicTank: boolean | null;
  septicTankType: string | null;
  septicTankCapacityLiters: number | null;
  numberOfSepticChambers: number | null;
  sewageTreatmentSystem: string | null;
  wastewaterTreatmentCapacity: string | null;
  greaseTrapInterceptor: boolean | null;
  solidWasteFacility: string | null;
  stormDrainageSystem: string | null;
  populationDesignCapacity: number | null;
  estimatedSanitaryCostCentavos: number | null;
}

export interface PlumbingData {
  waterServiceConnection: string | null;
  mainPipeSize: string | null;
  waterPipeMaterial: string | null;
  drainagePipeMaterial: string | null;
  sewerConnection: string | null;
  septicConnection: string | null;
  ventSystem: string | null;
  waterTankCapacityLiters: number | null;
  waterPumpCapacity: string | null;
  hotWaterSystem: string | null;
  fixtures: EquipmentRow[];
}

export interface ElectronicsData {
  systems: EquipmentRow[];
}

export interface InteriorDesignData {
  floorLevel: string | null;
  existingUse: string | null;
  proposedUse: string | null;
  totalInteriorAreaSqm: number | null;
  roomsAreasAffected: string | null;
  typeOfWork: string | null;
  partitionChanges: string | null;
  ceilingChanges: string | null;
  flooringChanges: string | null;
  wallFinish: string | null;
  ceilingFinish: string | null;
  furnitureEquipment: string | null;
  lightingAlterations: string | null;
  hvacCoordination: string | null;
  electricalCoordination: string | null;
  plumbingCoordination: string | null;
  fireProtectionCoordination: string | null;
  estimatedInteriorCostCentavos: number | null;
}

export interface FencingData {
  typeOfWork: string | null;
  fenceType: string | null;
  material: string | null;
  totalLengthMeters: number | null;
  frontLengthMeters: number | null;
  rearLengthMeters: number | null;
  leftSideLengthMeters: number | null;
  rightSideLengthMeters: number | null;
  averageHeightMeters: number | null;
  maximumHeightMeters: number | null;
  thicknessMeters: number | null;
  foundationType: string | null;
  numberOfGates: number | null;
  gateWidthMeters: number | null;
  estimatedCostCentavos: number | null;
}

export interface SignData {
  signType: string | null;
  signWording: string | null;
  numberOfSigns: number | null;
  widthMeters: number | null;
  heightMeters: number | null;
  totalSignAreaSqm: number | null;
  overallHeightAboveGroundMeters: number | null;
  clearanceAboveGradeMeters: number | null;
  numberOfFaces: number | null;
  signOrientation: string | null;
  illuminationType: string | null;
  electricalLoadKva: number | null;
  constructionMaterial: string | null;
  supportStructure: string | null;
  mountingMethod: string | null;
  exactPlacement: string | null;
  setbackFromPropertyLineMeters: number | null;
  distanceFromRoadMeters: number | null;
  estimatedCostCentavos: number | null;
}

export interface ExcavationData {
  purposeOfExcavation: string | null;
  excavationType: string | null;
  lengthMeters: number | null;
  widthMeters: number | null;
  areaSqm: number | null;
  maximumDepthMeters: number | null;
  estimatedVolumeCubicMeters: number | null;
  numberOfBasementLevels: number | null;
  soilClassification: string | null;
  groundwaterCondition: string | null;
  shoringMethod: string | null;
  retainingSystem: string | null;
  slopeProtection: string | null;
  dewateringMethod: string | null;
  excavationEquipment: string | null;
  proposedStartDate: string | null;
  proposedCompletionDate: string | null;
  excavatedMaterialDisposalSite: string | null;
  adjacentBuildings: string | null;
  undergroundUtilities: string | null;
  roadImpact: string | null;
  safetyBarricades: boolean | null;
  constructionSafetyOfficer: string | null;
}

export interface FireSafetySystemItem {
  id: string;
  system: string;
  required: boolean;
  installed: boolean | null;
  tested: boolean | null;
  compliant: boolean | null;
  remarks: string | null;
}

export interface FireSafetyData {
  natureOfProject: string | null;
  constructionType: string | null;
  approvedArchitecturalPlanRef: string | null;
  approvedStructuralPlanRef: string | null;
  approvedElectricalPlanRef: string | null;
  approvedMechanicalPlanRef: string | null;
  approvedSanitaryPlumbingPlanRef: string | null;
  approvedElectronicsPlanRef: string | null;
  approvedFireProtectionPlanRef: string | null;
  approvedPlanRevision: string | null;
  inspectionDate: string | null;
  fireSafetyInspector: string | null;
  reinspectionDate: string | null;
  evaluationOrInspectionResult: 'Approved' | 'Approved with Conditions' | 'Disapproved' | 'Pending' | null;
  fireMarshalRemarks: string | null;
  complianceTable: FireSafetySystemItem[];
}

export interface OccupancyData {
  certificateType: 'Full' | 'Partial' | null;
  floorsAreasAuthorized: string | null;
  areaAuthorizedSqm: number | null;
  areasExcluded: string | null;
  approvedUse: string | null;
  occupancyClassification: string | null;
  areaApprovedForOccupancySqm: number | null;
  completionDate: string | null;
  finalInspectionDate: string | null;
  finalInspectionResult: string | null;
  certificateOfCompletionRef: string | null;
  asBuiltPlanRevision: string | null;
}

/** Every optional per-family block. Which ones apply to a given application is driven entirely by generated-document.config.ts / the intake form — never inferred by presence/absence here. */
export interface TechnicalDataFamilies {
  buildingWorks?: BuildingWorksData;
  renovation?: RenovationData;
  addition?: AdditionData;
  demolition?: DemolitionData;
  zoningDecision?: ZoningDecisionData;
  architectural?: ArchitecturalData;
  structural?: StructuralData;
  electrical?: ElectricalData;
  mechanical?: MechanicalData;
  sanitary?: SanitaryData;
  plumbing?: PlumbingData;
  electronics?: ElectronicsData;
  interiorDesign?: InteriorDesignData;
  fencing?: FencingData;
  sign?: SignData;
  excavation?: ExcavationData;
  fireSafety?: FireSafetyData;
  occupancy?: OccupancyData;
}

/**
 * One record per application — the single source the generated document's
 * TechnicalSummarySection/EquipmentTable/ProfessionalSection/
 * RelatedPermitSection read from. Record-level Draft/Verified status (not
 * per-field) implements "reviewer-verified wins": staff is the only author
 * of this structured data (applicants only ever upload unstructured PDFs —
 * see document.model.ts), so there is never a competing lower-priority
 * "applicant value" stored here to reconcile against. Editing an
 * already-Verified record silently reopens it to 'Draft' and requires
 * re-verification before it can back an issued document again.
 */
export interface ApplicationTechnicalData {
  applicationId: string;
  common: CommonTechnicalData;
  families: TechnicalDataFamilies;
  status: TechnicalDataStatus;
  verifiedBy: string | null;
  verifiedAtValue: Date | null;
  verifiedAt: string | null;
  updatedAtValue: Date;
  updatedAt: string;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function emptyTechnicalData(applicationId: string): ApplicationTechnicalData {
  const now = new Date();
  return {
    applicationId,
    common: emptyCommonTechnicalData(),
    families: {},
    status: 'Draft',
    verifiedBy: null,
    verifiedAtValue: null,
    verifiedAt: null,
    updatedAtValue: now,
    updatedAt: formatDate(now),
  };
}
