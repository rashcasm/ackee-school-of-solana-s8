/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ancproject.json`.
 */
export type Ancproject = {
  "address": "4K6LtuL5hK9FGADBNgiw5cXyk3RPPz3LeLwq7M8xUzUS",
  "metadata": {
    "name": "ancproject",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "tip",
      "discriminator": [
        77,
        164,
        35,
        21,
        36,
        121,
        213,
        51
      ],
      "accounts": [
        {
          "name": "tipper",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator",
          "docs": [
            "because this program simply transfers lamports to it."
          ],
          "writable": true
        },
        {
          "name": "tipHistory",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  112,
                  95,
                  104,
                  105,
                  115,
                  116,
                  111,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "tipper"
              },
              {
                "kind": "arg",
                "path": "timestamp"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "message",
          "type": "string"
        },
        {
          "name": "timestamp",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "tipHistory",
      "discriminator": [
        168,
        181,
        168,
        138,
        249,
        57,
        106,
        156
      ]
    }
  ],
  "events": [
    {
      "name": "tipEvent",
      "discriminator": [
        213,
        36,
        191,
        50,
        28,
        25,
        189,
        252
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidAmount",
      "msg": "Amount must be greater than 0!"
    },
    {
      "code": 6001,
      "name": "insufficientBalance",
      "msg": "Insufficient balance!"
    }
  ],
  "types": [
    {
      "name": "tipEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tipper",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tipHistory",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tipper",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "message",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};

export const IDL : Ancproject = {
  "address": "4K6LtuL5hK9FGADBNgiw5cXyk3RPPz3LeLwq7M8xUzUS",
  "metadata": {
    "name": "ancproject",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "tip",
      "discriminator": [
        77,
        164,
        35,
        21,
        36,
        121,
        213,
        51
      ],
      "accounts": [
        {
          "name": "tipper",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator",
          "docs": [
            "because this program simply transfers lamports to it."
          ],
          "writable": true
        },
        {
          "name": "tipHistory",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  112,
                  95,
                  104,
                  105,
                  115,
                  116,
                  111,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "tipper"
              },
              {
                "kind": "arg",
                "path": "timestamp"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "message",
          "type": "string"
        },
        {
          "name": "timestamp",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "tipHistory",
      "discriminator": [
        168,
        181,
        168,
        138,
        249,
        57,
        106,
        156
      ]
    }
  ],
  "events": [
    {
      "name": "tipEvent",
      "discriminator": [
        213,
        36,
        191,
        50,
        28,
        25,
        189,
        252
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidAmount",
      "msg": "Amount must be greater than 0!"
    },
    {
      "code": 6001,
      "name": "insufficientBalance",
      "msg": "Insufficient balance!"
    }
  ],
  "types": [
    {
      "name": "tipEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tipper",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tipHistory",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tipper",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "message",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};