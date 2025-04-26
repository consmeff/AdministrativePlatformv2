export interface validationCheckDTO{
    title:string;
    status:boolean;
}

export interface ProfilePayload {
    first_name:       string;
    last_name:        string;
    other_names:      string;
    email:            string;
    phone_number:     string;
    alt_phone_number: string;
    password:         string;
  }

  export interface ProfileSuccessResponse {
    message:      string;
    email:        string;
    phone_number: string;
  }
  export interface ProfileFailResponse {
    non_field_errors: string[];
  }
  