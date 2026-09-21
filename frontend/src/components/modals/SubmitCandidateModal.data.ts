export interface CandidateRepoItem {
  id: string
  name: string
  candidateId: string
  email: string
  phone: string
  technology: string
  skills: string
  totalExperience: string
  currentCompany: string
  status: string
}

export const SAMPLE_EXISTING_CANDIDATES: CandidateRepoItem[] = [
  {
    id: '1',
    name: 'Priyanka Sharma',
    candidateId: '18016',
    email: 'priyanka.sharma@gmail.com',
    phone: '+91 98210 44905',
    technology: 'Test Manager / QA Lead',
    skills: 'Test Management, Automation Frameworks, Selenium',
    totalExperience: '11 Years 3 Months',
    currentCompany: 'Cognizant Technology Solutions',
    status: 'In Review',
  },
  {
    id: '2',
    name: 'VISHWATEJA THOPARAM',
    candidateId: '18015',
    email: 'vishwateja.t@gmail.com',
    phone: '+91 98765 49457',
    technology: 'QA Automation Engineer, SDET',
    skills: 'Java, Selenium WebDriver, TestNG, Cucumber',
    totalExperience: '5 Years 3 Months',
    currentCompany: 'Infosys Limited',
    status: 'New Profile',
  },
  {
    id: '3',
    name: 'SHILPA R',
    candidateId: '18014',
    email: 'shilpa.r@gmail.com',
    phone: '+91 99887 76998',
    technology: 'Storage, Virtualization, Ha-Ft Systems',
    skills: 'VMware ESXi, SAN/NAS Storage, NetApp',
    totalExperience: '5 Years 1 Month',
    currentCompany: 'Wipro Technologies',
    status: 'Submitted to Client',
  },
  {
    id: '4',
    name: 'AKASH MAHADEV TALBAR',
    candidateId: '18012',
    email: 'akash.talbar@gmail.com',
    phone: '+91 98112 26236',
    technology: 'Biw, Sheet Metal Product Design',
    skills: 'CATIA V5, NX CAD, BIW Closures',
    totalExperience: '5 Years 4 Months',
    currentCompany: 'Tata Technologies Ltd',
    status: 'Interview Scheduled',
  },
  {
    id: '5',
    name: 'AMIT KULKARNI',
    candidateId: '18010',
    email: 'amit.kulkarni@gmail.com',
    phone: '+91 98450 17712',
    technology: 'Software Engineering / C# Automation',
    skills: 'C#, .NET Core, SpecFlow, NUnit',
    totalExperience: '6 Years',
    currentCompany: 'Bosch Global Software Technologies',
    status: 'Shortlisted',
  },
]
