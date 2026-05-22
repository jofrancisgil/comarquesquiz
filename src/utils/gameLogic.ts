import { comarcasGeoJSON } from '../data/comarcas';
import { ComarcaInfo } from '../types/game';

// Helper to extract the name regardless of common property conventions
export const getComarcaName = (feature: any): string => {
  const props = feature.properties;
  if (!props) return 'Desconocida';
  return (
    props.name ||
    props.nom_comar ||
    props.NOM_COMAR ||
    props.comarca ||
    'Comarca'
  );
};

export const getComarcaCapital = (feature: any): string => {
  const props = feature.properties;
  if (!props) return 'Desconocida';
  return (
    props.cap_comar ||
    props.CAP_COMAR ||
    props.capital ||
    'Desconocida'
  );
};

export const getPreparedGeoJSON = () => {
  if (!comarcasGeoJSON || !comarcasGeoJSON.features) return null;
  // Clone to avoid mutating original
  const cloned = JSON.parse(JSON.stringify(comarcasGeoJSON));
  cloned.features.forEach((f: any, i: number) => {
    // Inject reliable ID directly into the feature for map styling
    f.id = `comarca_${i}`;
  });
  return cloned;
};

export const getAllComarcas = (geoData: any): ComarcaInfo[] => {
  if (!geoData || !geoData.features) return [];
  return geoData.features.map((f: any) => ({
    id: f.id,
    name: getComarcaName(f),
    capital: getComarcaCapital(f),
  }));
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const generateOptions = (
  targetId: string,
  allComarcas: ComarcaInfo[]
): ComarcaInfo[] => {
  // Always include the correct target
  const target = allComarcas.find((c) => c.id === targetId);
  if (!target) return [];

  // Get random incorrect options
  const incorrectOptions = allComarcas.filter((c) => c.id !== targetId);
  const shuffledIncorrect = shuffleArray(incorrectOptions);
  
  // Pick up to 3 incorrect (or fewer if dataset is tiny like in testing)
  const selectedIncorrect = shuffledIncorrect.slice(0, 3);
  
  return shuffleArray([target, ...selectedIncorrect]);
};
