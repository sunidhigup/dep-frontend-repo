import './App.css';
import { SnackbarProvider } from 'notistack';

// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/ScrollToTop';
import { BaseOptionChartStyle } from './components/chart/BaseOptionChart';
import ClientProvider from './context/ClientProvider';
import BatchProvider from './context/BatchProvider';
import JobListProvider from './context/JobListProvider';
import JobProvider from './context/JobProvider';
import RuleEngineTabProvider from './context/RuleEngineTabProvider';
import HomeTabProvider from './context/HomeTabProvider';
import AuthProvider from './context/AuthProvider';
import CountProvider from './context/CountProvider';
import InfraRegionProvider from './context/InfraRegionProvider';
import DataRegionProvider from './context/DataRegionProvider';
import DomainProvider from './context/DomainProvider';
import AccessTokenProvider from './context/AccessTokenProvider';
import QueryProvider from './context/QueryProvider';
import StreamProvider from './context/StreamProvider';
import SectionProvider from './context/SectionProvider';

// ----------------------------------------------------------------------

export default function App() {
  return (
    <AuthProvider>
      <SectionProvider>
        <InfraRegionProvider>
          <DataRegionProvider>
            <DomainProvider>
              <AccessTokenProvider>
                <ClientProvider>
                  <StreamProvider>
                    <BatchProvider>
                      <JobListProvider>
                        <QueryProvider>
                          <JobProvider>
                            <CountProvider>
                              <RuleEngineTabProvider>
                                <HomeTabProvider>
                                  <SnackbarProvider maxSnack={3}>
                                    <ThemeProvider>
                                      <ScrollToTop />
                                      <BaseOptionChartStyle />
                                      <Router />
                                    </ThemeProvider>
                                  </SnackbarProvider>
                                </HomeTabProvider>
                              </RuleEngineTabProvider>
                            </CountProvider>
                          </JobProvider>
                        </QueryProvider>
                      </JobListProvider>
                    </BatchProvider>
                  </StreamProvider>
                </ClientProvider>
              </AccessTokenProvider>
            </DomainProvider>
          </DataRegionProvider>
        </InfraRegionProvider>
      </SectionProvider>
    </AuthProvider>
  );
}
