export interface GenericRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface GenericRecordMetadataField<T> {
  isArray: boolean;
  isNullable: boolean;
  type: string;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  transform?: (value: unknown) => T;
}

export type GenericRecordMetadata<T extends GenericRecord> = {
  [K in keyof T]: GenericRecordMetadataField<T[K]>;
};

export const GenericRecordMetadataBase: GenericRecordMetadata<GenericRecord> = {
  id: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  createdAt: {
    isArray: false,
    isNullable: false,
    type: 'datetime',
    searchable: false,
    sortable: true,
    filterable: true
  },
  updatedAt: {
    isArray: false,
    isNullable: false,
    type: 'datetime',
    searchable: false,
    sortable: true,
    filterable: true
  },
  createdBy: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: false,
    filterable: true
  },
  updatedBy: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: false,
    filterable: true
  }
};
