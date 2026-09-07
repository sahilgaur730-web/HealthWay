import { useState, useEffect, useCallback } from 'react';
import { 
  fetchDistrictData, 
  DistrictData, 
  Facility, 
  MOCK_DISTRICT_DATA, 
  enrichDistrictData 
} from '../services/dashboardService';

export function useDashboard() {
  const [data, setData] = useState<DistrictData>(() => enrichDistrictData(MOCK_DISTRICT_DATA));
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchDistrictData();
      setData(result);
      setLastRefreshed(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchDistrictData().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  return {
    data,
    loading,
    isRefreshing,
    lastRefreshed,
    refreshDashboard,
    selectedFacility,
    setSelectedFacility
  };
}

export default useDashboard;
