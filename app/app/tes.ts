 //   [
    //     {
    //       $lookup: {
    //         from: 'rents',
    //         localField: 'rentId',
    //         foreignField: '_id',
    //         as: 'transactionRent'
    //       }
    //     },
    //     { $unwind: { path: '$transactionRent' } },
    //     {
    //       $lookup: {
    //         from: 'rooms',
    //         localField: 'transactionRent.roomId',
    //         foreignField: '_id',
    //         as: 'room'
    //       }
    //     },
    //     { $unwind: { path: '$room' } },
    //     {
    //       $lookup: {
    //         from: 'hostels',
    //         localField: 'room.hostelId',
    //         foreignField: '_id',
    //         as: 'hostel'
    //       }
    //     },
    //     { $unwind: { path: '$hostel' } },
    //     {
    //       $lookup: {
    //         from: 'owners',
    //         localField: 'hostel.ownerId',
    //         foreignField: '_id',
    //         as: 'owner'
    //       }
    //     },
    //     { $unwind: { path: '$owner' } },
    //     {
    //       $match: {
    //         'owner._id': ObjectId(
    //           '693dcfd8b69eaa40081ea1f3'
    //         )
    //       }
    //     },
    //     {
    //       $unset: [
    //         'transactionRent',
    //         'room',
    //         'hostel',
    //         'owner'
    //       ]
    //     }
    //   ],
    //   { maxTimeMS: 60000, allowDiskUse: true }
    // );