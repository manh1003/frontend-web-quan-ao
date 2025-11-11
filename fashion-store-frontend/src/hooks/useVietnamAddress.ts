import { useState, useEffect } from "react";
import {
  vietnamAddressApi,
  type Province,
  type District,
  type Ward,
} from "@/api/vietnamAddress";

export function useVietnamAddress() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);

  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoading((prev) => ({ ...prev, provinces: true }));
      const data = await vietnamAddressApi.getProvinces();
      setProvinces(data);
      setLoading((prev) => ({ ...prev, provinces: false }));
    };
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const loadDistricts = async () => {
        setLoading((prev) => ({ ...prev, districts: true }));
        const data = await vietnamAddressApi.getDistricts(selectedProvince);
        setDistricts(data);
        setWards([]);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setLoading((prev) => ({ ...prev, districts: false }));
      };
      loadDistricts();
    } else {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict(null);
      setSelectedWard(null);
    }
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const loadWards = async () => {
        setLoading((prev) => ({ ...prev, wards: true }));
        const data = await vietnamAddressApi.getWards(selectedDistrict);
        setWards(data);
        setSelectedWard(null);
        setLoading((prev) => ({ ...prev, wards: false }));
      };
      loadWards();
    } else {
      setWards([]);
      setSelectedWard(null);
    }
  }, [selectedDistrict]);

  const getProvinceName = (code: number | null) => {
    if (!code) return "";
    return provinces.find((p) => p.code === code)?.name || "";
  };

  const getDistrictName = (code: number | null) => {
    if (!code) return "";
    return districts.find((d) => d.code === code)?.name || "";
  };

  const getWardName = (code: number | null) => {
    if (!code) return "";
    return wards.find((w) => w.code === code)?.name || "";
  };

  return {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    setSelectedProvince,
    setSelectedDistrict,
    setSelectedWard,
    getProvinceName,
    getDistrictName,
    getWardName,
    loading,
  };
}
