package com.internlite.ingestion;

import java.util.List;

public interface SourceAdapter {
    String getSource();
    List<CanonicalJob> fetch() throws Exception;
}
