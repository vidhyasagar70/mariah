import { enquiryRepository, EnquiryFilter } from '../repositories/enquiry.repository';
import { CreateEnquiryInput } from '../validators/enquiry.validator';
import { emailService } from './email.service';

export class EnquiryService {
  async createEnquiry(input: CreateEnquiryInput) {
    const enquiry = await enquiryRepository.create(input);
    await emailService.sendEnquiryEmails(enquiry);
    return enquiry;
  }

  async getEnquiries(filters: { search?: string; startDate?: string; endDate?: string } = {}) {
    const queryFilter: EnquiryFilter = {};

    if (filters.search) {
      queryFilter.search = filters.search.trim().toLowerCase();
    }

    if (filters.startDate) {
      const date = new Date(filters.startDate);
      if (!isNaN(date.getTime())) {
        queryFilter.startDate = date;
      }
    }

    if (filters.endDate) {
      const date = new Date(filters.endDate);
      if (!isNaN(date.getTime())) {
        // Set end of day (23:59:59.999) to cover all submissions on that date
        date.setHours(23, 59, 59, 999);
        queryFilter.endDate = date;
      }
    }

    return enquiryRepository.findAll(queryFilter);
  }

  async deleteEnquiry(id: number) {
    return enquiryRepository.delete(id);
  }
}

export const enquiryService = new EnquiryService();
