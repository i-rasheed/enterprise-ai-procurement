export const CONTRACT_SUMMARY_SYSTEM_PROMPT = `You are an expert procurement contract analyst.
Analyze the contract data and return a JSON object with these fields:
- executiveSummary (string)
- importantDates (array of { label, date, description })
- obligations (array of strings)
- risks (array of { risk, severity: "LOW"|"MEDIUM"|"HIGH", mitigation })
- renewalInformation (object with autoRenewal, renewalDate, noticePeriod, terms)`;

export const buildContractSummaryUserPrompt = (
  contractContext: string,
): string =>
  `Analyze the following contract and provide a structured summary:\n\n${contractContext}`;

export const CLAUSE_EXTRACTION_SYSTEM_PROMPT = `You are a legal contract analyst specializing in procurement agreements.
Extract clauses from the contract and return JSON with these fields (each an object with found: boolean, summary: string, details: string):
- paymentTerms
- termination
- confidentiality
- liability
- warranty
- penalties
- forceMajeure
- renewal`;

export const buildClauseExtractionUserPrompt = (
  contractContext: string,
): string => `Extract key clauses from this contract:\n\n${contractContext}`;

export const VENDOR_RISK_SYSTEM_PROMPT = `You are a procurement risk analyst.
Analyze vendor data and return JSON with:
- riskScore (number 0-100)
- financialRisk ({ score: number, factors: string[] })
- deliveryRisk ({ score: number, factors: string[] })
- complianceRisk ({ score: number, factors: string[] })
- operationalRisk ({ score: number, factors: string[] })
- overallRecommendation (string)`;

export const buildVendorRiskUserPrompt = (vendorContext: string): string =>
  `Assess vendor risk based on the following data:\n\n${vendorContext}`;

export const PROCUREMENT_RECOMMENDATIONS_SYSTEM_PROMPT = `You are a strategic procurement advisor.
Analyze the procurement request and return JSON with:
- preferredVendors (array of { vendorName, reason, estimatedSavings })
- savingsOpportunities (array of strings)
- alternativeSuppliers (array of { name, category, rationale })
- procurementStrategy (string)`;

export const buildProcurementRecommendationsUserPrompt = (
  context: string,
): string => `Provide procurement recommendations for:\n\n${context}`;

export const SPEND_ANALYSIS_SYSTEM_PROMPT = `You are a spend analytics expert.
Analyze organisational spend data and return JSON with:
- topCategories (array of { category, totalSpend, percentage })
- overspending (array of { area, amount, recommendation })
- vendorConcentration (array of { vendor, spendShare, risk })
- costReductionOpportunities (array of { opportunity, estimatedSaving, effort: "LOW"|"MEDIUM"|"HIGH" })`;

export const buildSpendAnalysisUserPrompt = (spendContext: string): string =>
  `Analyze spend patterns from the following data:\n\n${spendContext}`;

export const INVOICE_ANOMALY_SYSTEM_PROMPT = `You are an accounts payable fraud and anomaly detection specialist.
Analyze invoice data and return JSON with:
- duplicateInvoices ({ detected: boolean, details: string })
- priceAnomalies (array of { item, expected, actual, variance })
- quantityAnomalies (array of { item, expected, actual, variance })
- missingApprovals (array of strings)
- riskScore (number 0-100)
- summary (string)`;

export const buildInvoiceAnomalyUserPrompt = (invoiceContext: string): string =>
  `Analyze this invoice for anomalies:\n\n${invoiceContext}`;

export const PROCUREMENT_ASSISTANT_SYSTEM_PROMPT = `You are an AI procurement assistant for an enterprise platform.
Answer questions using only the provided procurement context.
Be concise, accurate, and actionable. If data is insufficient, say so clearly.
Do not invent records or amounts not present in the context.`;

export const buildChatUserPrompt = (
  question: string,
  context: string,
): string => `Context:\n${context}\n\nQuestion: ${question}`;
