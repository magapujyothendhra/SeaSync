import { useState, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { PollutionReport, OfflineReport } from '@/constants/types';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

const OFFLINE_QUEUE_KEY = 'seasync_offline_queue';
const REPORTS_CACHE_KEY = 'seasync_reports_cache';

export const [ReportsProvider, useReports] = createContextHook(() => {
  const [reports, setReports] = useState<PollutionReport[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<OfflineReport[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const saveOfflineQueue = async (queue: OfflineReport[]) => {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      console.log(`Saved ${queue.length} reports to offline queue`);
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  };

  const cacheReports = async (reportsToCache: PollutionReport[]) => {
    try {
      await AsyncStorage.setItem(REPORTS_CACHE_KEY, JSON.stringify(reportsToCache));
    } catch (error) {
      console.error('Failed to cache reports:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const reportsRef = collection(db, 'pollution_reports');
      const q = query(reportsRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      
      const fetchedReports: PollutionReport[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        synced: true
      })) as PollutionReport[];
      
      console.log(`Fetched ${fetchedReports.length} reports from Firebase`);
      setReports(fetchedReports);
      await cacheReports(fetchedReports);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setIsLoading(false);
    }
  };

  const uploadPhoto = async (base64Photo: string): Promise<string> => {
    const blob = await (await fetch(`data:image/jpeg;base64,${base64Photo}`)).blob();
    const filename = `pollution_${Date.now()}.jpg`;
    const storageRef = ref(storage, `reports/${filename}`);
    
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    console.log('Photo uploaded:', downloadUrl);
    return downloadUrl;
  };

  const syncReport = async (report: OfflineReport) => {
    let photoUrl: string | undefined;

    if (report.photoBase64) {
      photoUrl = await uploadPhoto(report.photoBase64);
    }

    const reportData = {
      type: report.type,
      description: report.description,
      latitude: report.latitude,
      longitude: report.longitude,
      timestamp: report.timestamp,
      photoUrl,
      userId: report.userId
    };

    await addDoc(collection(db, 'pollution_reports'), reportData);
    console.log('Report synced to Firebase');
  };

  const addReport = async (report: Omit<OfflineReport, 'localId'>) => {
    const newReport: OfflineReport = {
      ...report,
      localId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    if (!isOnline) {
      console.log('Offline: Adding report to queue');
      const updatedQueue = [...offlineQueue, newReport];
      setOfflineQueue(updatedQueue);
      await saveOfflineQueue(updatedQueue);
      return;
    }

    try {
      console.log('Online: Syncing report immediately');
      await syncReport(newReport);
      await fetchReports();
    } catch (error) {
      console.error('Failed to sync report, adding to offline queue:', error);
      const updatedQueue = [...offlineQueue, newReport];
      setOfflineQueue(updatedQueue);
      await saveOfflineQueue(updatedQueue);
    }
  };

  const syncOfflineReports = async () => {
    if (offlineQueue.length === 0 || isSyncing) return;

    console.log(`Starting sync of ${offlineQueue.length} offline reports`);
    setIsSyncing(true);

    const failedReports: OfflineReport[] = [];

    for (const report of offlineQueue) {
      try {
        await syncReport(report);
      } catch (error) {
        console.error('Failed to sync report:', error);
        failedReports.push(report);
      }
    }

    setOfflineQueue(failedReports);
    await saveOfflineQueue(failedReports);
    
    if (failedReports.length === 0) {
      console.log('All reports synced successfully');
    } else {
      console.log(`${failedReports.length} reports failed to sync`);
    }

    setIsSyncing(false);
    await fetchReports();
  };

  const addSampleReports = async () => {
    const sampleReports = [
      {
        type: 'plastic' as const,
        description: 'Large accumulation of plastic bottles and bags washed up on the beach near the pier. Approximately 50+ items visible.',
        latitude: 33.7701,
        longitude: -118.1937,
        timestamp: Date.now() - 1000 * 60 * 45,
        userId: 'sample_user_1'
      },
      {
        type: 'oil-spill' as const,
        description: 'Small oil sheen detected in harbor area, appears to be coming from nearby boats. Roughly 20 meter diameter.',
        latitude: 33.7501,
        longitude: -118.1737,
        timestamp: Date.now() - 1000 * 60 * 60 * 3,
        userId: 'sample_user_2'
      },
      {
        type: 'debris' as const,
        description: 'Fishing nets and ropes tangled in rocky area. Possible hazard to marine life.',
        latitude: 33.7601,
        longitude: -118.1837,
        timestamp: Date.now() - 1000 * 60 * 60 * 8,
        userId: 'sample_user_3'
      },
      {
        type: 'chemical' as const,
        description: 'Unusual discoloration in water near industrial outflow. Strong chemical odor reported.',
        latitude: 33.7401,
        longitude: -118.1637,
        timestamp: Date.now() - 1000 * 60 * 60 * 24,
        userId: 'sample_user_4'
      },
      {
        type: 'sewage' as const,
        description: 'Sewage overflow detected after heavy rainfall. Beach access restricted.',
        latitude: 33.7301,
        longitude: -118.1537,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
        userId: 'sample_user_5'
      }
    ];

    try {
      console.log('Adding sample reports to Firebase...');
      for (const report of sampleReports) {
        await addDoc(collection(db, 'pollution_reports'), report);
      }
      console.log('Sample reports added successfully');
      await fetchReports();
    } catch (error) {
      console.error('Failed to add sample reports:', error);
    }
  };

  useEffect(() => {
    const loadOfflineQueue = async () => {
      try {
        const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        if (stored) {
          const queue = JSON.parse(stored) as OfflineReport[];
          console.log(`Loaded ${queue.length} offline reports from storage`);
          setOfflineQueue(queue);
        }
      } catch (error) {
        console.error('Failed to load offline queue:', error);
      }
    };

    const loadCachedReports = async () => {
      try {
        const stored = await AsyncStorage.getItem(REPORTS_CACHE_KEY);
        if (stored) {
          const cached = JSON.parse(stored) as PollutionReport[];
          console.log(`Loaded ${cached.length} cached reports`);
          setReports(cached);
        }
      } catch (error) {
        console.error('Failed to load cached reports:', error);
      }
    };

    const initialize = async () => {
      await loadOfflineQueue();
      await loadCachedReports();
      await fetchReports();
      
      const hasSampleReports = await AsyncStorage.getItem('seasync_has_sample_reports');
      if (!hasSampleReports) {
        await addSampleReports();
        await AsyncStorage.setItem('seasync_has_sample_reports', 'true');
      }
    };

    initialize();

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      console.log('Network status:', online ? 'Online' : 'Offline');
      setIsOnline(online);
      
      if (online) {
        syncOfflineReports();
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    reports,
    offlineQueue,
    isOnline,
    isSyncing,
    isLoading,
    addReport,
    syncOfflineReports,
    refreshReports: fetchReports,
    addSampleReports
  };
});
